import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentCredits, setCurrentCredits] = useState(0);
  const [counts, setCounts] = useState({
    total: 0,
    purchase: 0,
    usage: 0,
    refund: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = filter === 'all'
        ? '/api/user/transactions'
        : `/api/user/transactions?type=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setCurrentCredits(data.currentCredits || 0);
      setCounts(data.counts || { total: 0, purchase: 0, usage: 0, refund: 0 });
      setError(null);
    } catch (err) {
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return '💳';
      case 'usage':
        return '🎨';
      case 'refund':
        return '↩️';
      default:
        return '📊';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600';
      case 'usage':
        return 'text-red-600';
      case 'refund':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'purchase' ? '+' : type === 'refund' ? '+' : '-';
    return `${sign}${Math.abs(amount)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'purchase':
        return 'Compra';
      case 'usage':
        return 'Uso';
      case 'refund':
        return 'Reembolso';
      default:
        return type;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Transaction History | PixelAlchemy</title>
        <meta name="description" content="Complete history of your purchases and credit usage on PixelAlchemy" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Transacciones</h1>
          <p className="text-gray-600">Revisa todas tus compras y uso de créditos</p>
        </div>

        {/* Credits Overview */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Créditos Disponibles</p>
              <p className="text-4xl font-bold">{currentCredits}</p>
            </div>
            <div className="text-right">
              <Link href="/pricing">
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                  Comprar Más
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({counts.total})
            </button>
            <button
              onClick={() => setFilter('purchase')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'purchase'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💳 Compras ({counts.purchase})
            </button>
            <button
              onClick={() => setFilter('usage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'usage'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎨 Uso ({counts.usage})
            </button>
            <button
              onClick={() => setFilter('refund')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'refund'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ↩️ Reembolsos ({counts.refund})
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Transactions List */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sin transacciones
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all'
                    ? 'Aún no tienes ninguna transacción.'
                    : `No tienes transacciones de tipo ${getTransactionTypeLabel(filter)}.`}
                </p>
                {filter === 'all' && (
                  <Link href="/pricing">
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                      Comprar Créditos
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.description || getTransactionTypeLabel(transaction.type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                          {transaction.paddle_payment_id && (
                            <p className="text-xs text-gray-400 mt-1">
                              ID de pago: {transaction.paddle_payment_id}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getTransactionColor(transaction.type)}`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                        <p className="text-sm text-gray-500">créditos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        {!loading && !error && transactions.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-800 text-sm mb-3">
              Si tienes preguntas sobre tus transacciones o necesitas un reembolso,
              por favor contáctanos a través de nuestro soporte.
            </p>
            <Link href="/pricing">
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Ver planes de precios →
              </button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}