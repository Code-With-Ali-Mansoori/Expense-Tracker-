"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Expense_1 = require("../models/Expense");
const ChatMessage_1 = require("../models/ChatMessage");
const router = (0, express_1.Router)();
// GET /api/ai/chat/history - Returns full chat thread, sorted oldest to newest
router.get('/chat/history', auth_1.verifyToken, async (req, res) => {
    try {
        const history = await ChatMessage_1.ChatMessage.find({ userId: req.userId }).sort({ createdAt: 1 });
        return res.status(200).json(history);
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ error: 'Server error fetching chat history' });
    }
});
// POST /api/ai/chat
router.post('/chat', auth_1.verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message content is required' });
        }
        // 1. Save user message to ChatMessage
        const userMessage = new ChatMessage_1.ChatMessage({
            userId: req.userId,
            role: 'user',
            content: message,
        });
        await userMessage.save();
        // 2. Fetch last 10 messages for this user for context
        const previousMessages = await ChatMessage_1.ChatMessage.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(10);
        // Sort oldest to newest to provide in-order context
        const last10Messages = previousMessages.reverse();
        // 3. Build financial context summary
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const now = new Date();
        // Current month range
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        // Last month range
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        // Sum of expenses for this month and last month
        const thisMonthExpenses = await Expense_1.Expense.find({
            userId: req.userId,
            date: { $gte: startOfThisMonth, $lte: endOfThisMonth },
        });
        const lastMonthExpenses = await Expense_1.Expense.find({
            userId: req.userId,
            date: { $gte: startOfLastMonth, $lte: statsEndDate(now) }, // support overlapping dates if needed
        });
        // Actually, calculate last month exactly:
        const lastMonthExpensesExact = await Expense_1.Expense.find({
            userId: req.userId,
            date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        });
        const totalSpentThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalSpentLastMonth = lastMonthExpensesExact.reduce((sum, exp) => sum + exp.amount, 0);
        // Spending by category this month
        const spendingByCategory = {
            food: 0,
            travel: 0,
            shopping: 0,
            bills: 0,
            entertainment: 0,
            health: 0,
            other: 0,
        };
        thisMonthExpenses.forEach((exp) => {
            if (spendingByCategory[exp.category] !== undefined) {
                spendingByCategory[exp.category] += exp.amount;
            }
        });
        // Last 10 transactions
        const last10Expenses = await Expense_1.Expense.find({ userId: req.userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(10);
        const recentTransactions = last10Expenses.map((exp) => ({
            name: exp.name,
            amount: exp.amount,
            category: exp.category,
            date: exp.date.toISOString().split('T')[0],
        }));
        const normalizedMessage = message.toLowerCase();
        const financeKeywords = ['expense', 'expenses', 'spending', 'budget', 'income', 'salary', 'saving', 'savings', 'debt', 'loan', 'finance', 'money', 'cash flow', 'transaction', 'transactions', 'bill', 'bills', 'goal', 'cost', 'costs', 'category', 'monthly', 'shop', 'shopping'];
        const isFinanceRelated = financeKeywords.some((keyword) => normalizedMessage.includes(keyword));
        if (!isFinanceRelated) {
            const apologyReply = 'Sorry, I can only help with questions about your personal finances, spending, budget, income, or savings using your own expense data.';
            const assistantMessage = new ChatMessage_1.ChatMessage({
                userId: req.userId,
                role: 'assistant',
                content: apologyReply,
            });
            await assistantMessage.save();
            return res.status(200).json({ reply: apologyReply });
        }
        // 4. Construct system prompt
        const systemPrompt = `You are a personal finance advisor inside an expense tracking app.

User's monthly income: ₹${user.monthlyIncome}
User's stated goal: ${user.purpose}
This month's spending: ₹${totalSpentThisMonth}
Last month's spending: ₹${totalSpentLastMonth}
Spending by category: ${JSON.stringify(spendingByCategory)}
Recent transactions: ${JSON.stringify(recentTransactions)}

Rules:
- Only answer using the data above. Never invent numbers.
- If goal is "savings", emphasize savings rate and overspending alerts.
- If goal is "habits", focus on patterns and behavioral insights.
- If asked something unrelated to personal finance, politely say you can only help with questions about their spending, budget, income, savings, or expense history.
- Keep responses concise (2-4 sentences) unless asked for more detail.
- Use bullet points if listing multiple insights.
- If the user has no transactions yet, encourage them to add their first expense and explain what insights you'll give once they do.
- Use ₹ for currency, be specific with real numbers from their data.`;
        let reply = '';
        // Read API key from the environment file and validate it before the Gemini API call.
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!geminiKey) {
            console.error('Gemini API key is missing. Set GEMINI_API_KEY or GOOGLE_API_KEY in the environment.');
            reply = getMockAdvice(user.monthlyIncome, user.purpose, totalSpentThisMonth, totalSpentLastMonth, spendingByCategory);
        }
        else {
            try {
                // Gemini API call is made here to generate the finance response.
                const geminiContents = last10Messages.map((msg) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                }));
                const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                    contents: geminiContents,
                    systemInstruction: {
                        parts: [{ text: systemPrompt }],
                    },
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 300,
                    },
                }, {
                    timeout: 20000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (candidateText) {
                    reply = candidateText;
                }
                else {
                    throw new Error('Gemini response format invalid');
                }
            }
            catch (err) {
                // Handle Gemini rate-limit and other API errors here without exposing the full stack trace.
                if (err?.response?.status === 429) {
                    console.error('Gemini API quota exceeded. Please check the API plan or try again later.');
                    reply = 'AI service is temporarily unavailable because the Gemini quota has been exceeded. Please try again later.';
                }
                else {
                    console.error('Gemini API error:', err?.response?.data?.error?.message || err.message);
                    reply = getMockAdvice(user.monthlyIncome, user.purpose, totalSpentThisMonth, totalSpentLastMonth, spendingByCategory);
                }
            }
        }
        // 7. Save the AI's reply to ChatMessage
        const assistantMessage = new ChatMessage_1.ChatMessage({
            userId: req.userId,
            role: 'assistant',
            content: reply,
        });
        await assistantMessage.save();
        // 8. Return response
        return res.status(200).json({ reply });
    }
    catch (error) {
        console.error('Error in AI Advisor:', error);
        return res.status(500).json({ error: 'Server error generating AI response' });
    }
});
// Helper functions for date range and mock responses
function statsEndDate(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function getMockAdvice(monthlyIncome, purpose, totalSpentThisMonth, totalSpentLastMonth, spendingByCategory) {
    // If no transactions yet
    if (totalSpentThisMonth === 0 && totalSpentLastMonth === 0) {
        return `Hello! I am your AI Finance Advisor. I see that you don't have any transactions logged yet. To get started, please add your first expense using the floating '+' button. Once you log your spending, I can help you analyze your habits and find savings opportunities relative to your monthly income of ₹${monthlyIncome}!`;
    }
    const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - totalSpentThisMonth) / monthlyIncome) * 100) : 0;
    let advice = `Based on your data:
- Your spending this month is ₹${totalSpentThisMonth} compared to ₹${totalSpentLastMonth} last month.
- Out of your monthly income of ₹${monthlyIncome}, you have saved ₹${Math.max(0, monthlyIncome - totalSpentThisMonth)} (a ${savingsRate}% savings rate).
`;
    if (purpose === 'savings') {
        advice += `\nTo align with your savings goal, try cutting down on non-essential categories. Currently, your top spending areas are being tracked.`;
    }
    else if (purpose === 'habits') {
        advice += `\nLet's keep monitoring your transaction patterns to identify overspending early in the month.`;
    }
    else {
        advice += `\nYou are doing well tracking your budgets. Keep logging your expenses to build a clean transaction history!`;
    }
    return advice;
}
exports.default = router;
