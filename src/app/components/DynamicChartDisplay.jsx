import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-chart-funnel';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';

Chart.register(...registerables);
Chart.register(FunnelController, TrapezoidElement);

const tatMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DynamicChartDisplay = ({
    dropdowns, // [{ label, options, value, onChange }]
    chartTitle = "Sample Count by Test Name",
    chartData,
    chartHeight = 340,
    dropdownStacked = false,
    chartType = "bar", // <-- add this
}) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        if (!chartData || chartData.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        const labels = chartData.map(item => item.label);
        const data = chartData.map(item => item.value);

        // Dynamically set max for y-axis to make bars taller
        const maxY = data.length > 0 ? (Math.max(...data) < 5 ? 5 : Math.ceil(Math.max(...data) * 1.2)) : undefined;

        let chartConfig;
        if (chartType === "line") {
            chartConfig = {
                type: 'line',
                data: {
                    datasets: [{
                        label: chartTitle,
                        data: chartData, // [{x, y}]
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#6366f1',
                        fill: false,
                        parsing: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            type: 'category',
                            title: { display: true, text: 'Month' },
                            ticks: { color: '#374151', font: { size: 14, weight: 'bold' } },
                            grid: { display: false },
                        },
                        y: {
                            beginAtZero: true,
                            max: "500px",
                            ticks: { color: '#374151', font: { size: 14, weight: 'bold' } },
                            grid: {
                                color: '#e5e7eb',
                                borderDash: [4, 4],
                                drawTicks: false,
                                drawBorder: false,
                            }
                        }
                    }
                }
            };
        } else if (chartType === "scatter") {
            chartConfig = {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: chartTitle,
                        data: chartData, // [{x, y}]
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: '#6366f1',
                        pointRadius: 6,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: '#6366f1',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#fff',
                            borderWidth: 1,
                            padding: 10,
                        },
                    },
                    scales: {
                        x: {
                            type: 'category',
                            labels: tatMonthNames,
                            title: { display: true, text: 'Month' },
                            ticks: { color: '#374151', font: { size: 14, weight: 'bold' } },
                            grid: { display: false },
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'TAT Days' },
                            ticks: { color: '#374151', font: { size: 14, weight: 'bold' } },
                            grid: {
                                color: '#e5e7eb',
                                borderDash: [4, 4],
                                drawTicks: false,
                                drawBorder: false,
                            }
                        }
                    }
                }
            };
        } else if (chartType === "funnel") {
            chartConfig = {
                type: 'funnel',
                data: {
                    labels: chartData.map(item => item.label),
                    datasets: [{
                        label: chartTitle,
                        data: chartData.map(item => item.value),
                        backgroundColor: [
                            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: '#6366f1',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#fff',
                            borderWidth: 1,
                            padding: 10,
                        },
                    },
                }
            };
        } else {
            chartConfig = {
                type: chartType, // <-- use this
                data: {
                    labels,
                    datasets: [{
                        label: chartTitle,
                        data,
                        backgroundColor: chartType === 'bar'
                            ? (context) => {
                                const chart = context.chart;
                                const { ctx, chartArea } = chart;
                                if (!chartArea) return null;
                                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                                gradient.addColorStop(0, 'rgba(54, 162, 235, 0.7)');
                                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.9)');
                                return gradient;
                            }
                            : 'rgba(99, 102, 241, 0.7)',
                        borderColor: chartType === 'line' ? '#6366f1' : undefined,
                        borderWidth: 2,
                        fill: chartType === 'line' ? false : true,
                        tension: chartType === 'line' ? 0.4 : undefined,
                        pointRadius: chartType === 'line' ? 5 : undefined,
                        pointBackgroundColor: chartType === 'line' ? '#6366f1' : undefined,
                        borderRadius: chartType === 'bar' ? 12 : undefined,
                        barPercentage: chartType === 'bar' ? 0.6 : undefined,
                        categoryPercentage: chartType === 'bar' ? 0.5 : undefined,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: '#6366f1',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#fff',
                            borderWidth: 1,
                            padding: 10,
                        },
                    },
                    layout: { padding: 0 },
                    scales: {
                        x: {
                            ticks: {
                                color: '#374151',
                                font: { size: 14, weight: 'bold' },
                                autoSkip: false,
                                maxRotation: 0,
                                minRotation: 0,
                                callback: function (value, index, values) {
                                    // Get the label for this tick
                                    const label = this.getLabelForValue
                                        ? this.getLabelForValue(value)
                                        : value;
                                    // Split label into lines of max 12 chars (adjust as needed)
                                    if (typeof label === "string" && label.length > 12) {
                                        return label.match(/.{1,12}/g); // returns array of strings
                                    }
                                    return label;
                                }
                            },
                            grid: { display: false },
                        },
                        y: {
                            beginAtZero: true,
                            // max: maxY, // <-- This line fixes the bar height!
                            ticks: {
                                color: '#374151',
                                font: { size: 14, weight: 'bold' },
                            },
                            grid: {
                                color: '#e5e7eb',
                                borderDash: [4, 4],
                                drawTicks: false,
                                drawBorder: false,
                            }
                        },
                    },
                },
            };
        }

        chartInstanceRef.current = new Chart(ctx, chartConfig);

        return () => {
            if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        };
    }, [chartData, chartType, chartTitle]);

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex w-full items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-white ml-2">
                    {chartTitle}
                </h2>
                <div className={`mb-4 ${dropdownStacked ? 'flex flex-col gap-2 items-end' : 'flex flex-wrap gap-4 items-center justify-end'}`}>
                    {dropdowns.map((dropdown, idx) => (
                        <DropdownMenu key={idx}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="min-w-[180px] max-w-xs border-2 border-indigo-500 dark:border-indigo-300 text-gray-700 p-2 px-4 rounded-lg dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md font-semibold text-left truncate"
                                    type="button"
                                >
                                    {dropdown.value
                                        ? dropdown.value.length > 30
                                            ? dropdown.value.slice(0, 30) + "..."
                                            : dropdown.value
                                        : dropdown.label}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[180px] max-w-xs whitespace-normal">
                                <DropdownMenuLabel>{dropdown.label}</DropdownMenuLabel>
                                {/* Add a clear option */}
                                <DropdownMenuItem
                                    key="__clear__"
                                    onSelect={() => dropdown.onChange("")}
                                    className={`whitespace-normal break-words ${dropdown.value === "" ? "font-bold bg-indigo-100 dark:bg-indigo-900" : ""}`}
                                >
                                    {dropdown.label === "Select Month" ? "All Months" : dropdown.label === "Select Year" ? "All Years" : dropdown.label === "Select Test Name" ? "All Tests" : "Clear"}
                                </DropdownMenuItem>
                                {dropdown.options.map(opt => (
                                    <DropdownMenuItem
                                        key={opt}
                                        onSelect={() => dropdown.onChange(opt)}
                                        className={`whitespace-normal break-words ${dropdown.value === opt ? "font-bold bg-indigo-100 dark:bg-indigo-900" : ""}`}
                                    >
                                        {opt}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ))}
                </div>
            </div>
            <div className={`w-full h-[${chartHeight}px] flex items-center justify-center`}>
                {(!chartData || chartData.length === 0) ? (
                    <span className="text-gray-400 text-lg">No data available for the selected filters.</span>
                ) : (
                    <canvas ref={chartRef} className="!bg-transparent" />
                )}
            </div>
        </div>
    );
};

export default DynamicChartDisplay;