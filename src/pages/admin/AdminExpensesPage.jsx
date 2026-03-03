import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Download, Edit2, Trash2, Loader2, DollarSign, ArrowUpRight, ArrowDownRight, Search, AlertTriangle, X } from "lucide-react";
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from "../../api/adminApi";
import Modal from "../../components/Modal";

// Helper function to export to CSV
const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = ["ID", "Expense Name", "Amount", "Type", "Account", "Date", "Logged By"];
    const csvRows = [headers.join(",")];

    data.forEach(row => {
        const values = [
            row.id,
            `"${row.expenseName}"`,
            row.amount,
            row.type,
            `"${row.accountName}"`,
            row.transactionDate,
            `"${row.createdByUserName || ''}"`
        ];
        csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const EMPTY_FORM = { expenseName: "", amount: "", type: "DEBIT", accountName: "", transactionDate: format(new Date(), "yyyy-MM-dd") };

const AdminExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM format

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await getAllExpenses();
            setExpenses(res.data);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            const matchesSearch = e.expenseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.accountName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMonth = filterMonth ? e.transactionDate.startsWith(filterMonth) : true;
            return matchesSearch && matchesMonth;
        });
    }, [expenses, searchQuery, filterMonth]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedExpense) {
                await updateExpense(selectedExpense.id, formData);
            } else {
                await createExpense(formData);
            }
            setModalOpen(false);
            fetchExpenses();
        } catch (error) {
            window.alert("Failed to save expense tracking record.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleteModalOpen(id);
    };

    const confirmDelete = async () => {
        if (!deleteModalOpen) return;
        try {
            await deleteExpense(deleteModalOpen);
            fetchExpenses();
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setDeleteModalOpen(null);
        }
    };

    const openCreate = () => {
        setSelectedExpense(null);
        setFormData(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (expense) => {
        setSelectedExpense(expense);
        setFormData({
            expenseName: expense.expenseName,
            amount: expense.amount,
            type: expense.type,
            accountName: expense.accountName,
            transactionDate: expense.transactionDate
        });
        setModalOpen(true);
    };

    const totalDebit = useMemo(() => filteredExpenses.filter(e => e.type === "DEBIT").reduce((acc, curr) => acc + parseFloat(curr.amount), 0), [filteredExpenses]);
    const totalCredit = useMemo(() => filteredExpenses.filter(e => e.type === "CREDIT").reduce((acc, curr) => acc + parseFloat(curr.amount), 0), [filteredExpenses]);
    const netBalance = totalCredit - totalDebit;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Expenses</h1>
                    <p className="text-slate-500 text-sm mt-1">Track internal accounts, debits, credits, and ledger balance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => exportToCSV(filteredExpenses, `expenses_export_${format(new Date(), "yyyyMMdd")}.csv`)}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm shadow-indigo-200"
                    >
                        <Plus className="w-4 h-4" /> Record Transaction
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-1">Total Received (Credit)</p>
                        <h3 className="text-2xl font-bold text-emerald-600">${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-1">Total Spent (Debit)</p>
                        <h3 className="text-2xl font-bold text-red-600">${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                    </div>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-slate-400 text-[13px] font-bold uppercase tracking-wider mb-1">Net Balance</p>
                        <h3 className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {netBalance < 0 ? "-" : "+"}${Math.abs(netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search descriptions or accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter Month:</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="month"
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 w-full sm:w-auto"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                            />
                            {filterMonth && (
                                <button
                                    onClick={() => setFilterMonth("")}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest px-2"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">Transaction Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Account</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading ledger...
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                                            {format(new Date(expense.transactionDate), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-900 font-semibold max-w-xs truncate">
                                            {expense.expenseName}
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-600">
                                            {expense.accountName}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${expense.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {expense.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-3.5 text-right font-bold ${expense.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {expense.type === 'CREDIT' ? '+' : '-'}${parseFloat(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(expense)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                    <div className="p-6 rounded-2xl bg-white">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">{selectedExpense ? "Edit Transaction" : "Record Transaction"}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Office Rent, Server Costs..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    value={formData.expenseName}
                                    onChange={e => setFormData({ ...formData, expenseName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                                    <select
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="DEBIT">Debit (Expense)</option>
                                        <option value="CREDIT">Credit (Income)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Account / Source</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Chase Business, Client Payment"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.accountName}
                                        onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.transactionDate}
                                        onChange={e => setFormData({ ...formData, transactionDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {selectedExpense ? "Save Changes" : "Record Transaction"}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
            {/* Delete Confirmation Modal (Tailwind custom overlay) */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="p-6 rounded-2xl bg-white max-w-sm w-full mx-auto shadow-2xl relative shadow-red-900/10 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setDeleteModalOpen(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Transaction</h3>
                            <p className="text-sm text-slate-500 mb-6 px-2">
                                Are you sure you want to permanently delete this expense record? This cannot be undone.
                            </p>
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setDeleteModalOpen(null)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminExpensesPage;
