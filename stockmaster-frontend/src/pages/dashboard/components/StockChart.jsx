import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axiosClient from '../../../utils/axiosClient';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StockChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await axiosClient.get('/dashboard/chart');
                if (response.success) {
                    setChartData({
                        labels: response.data.labels,
                        datasets: [
                            {
                                label: 'Stock In',
                                data: response.data.datasets[0].data,
                                backgroundColor: '#4f46e5', // indigo-600
                                barPercentage: 0.6,
                                categoryPercentage: 0.8
                            },
                            {
                                label: 'Stock Out',
                                data: response.data.datasets[1].data,
                                backgroundColor: '#e2e8f0', // slate-200
                                barPercentage: 0.6,
                                categoryPercentage: 0.8
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error("Error fetching chart data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 12 }
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f1f5f9',
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        borderRadius: 6,
    };

    if (loading) {
        return (
            <div className="h-[400px] w-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-6 w-32 bg-slate-100 rounded mb-6"></div>
                <div className="h-[300px] bg-slate-50 rounded"></div>
            </div>
        );
    }

    if (!chartData) return null;

    return (
        <div className="h-[400px] w-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="font-semibold text-slate-900">Stock Movement</h3>
            </div>
            <div className="h-[300px] w-full">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

export default StockChart;
