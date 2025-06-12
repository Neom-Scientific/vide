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
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables);
Chart.register(FunnelController, TrapezoidElement);
Chart.register(ChartDataLabels);

const tatMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DynamicChartDisplay = ({
    dropdowns = [],
    chartTitle = "Sample Count by Test Name",
    chartData,
    chartHeight = 340,
    dropdownStacked = false,
    chartType = "bar",
}) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        let config;

        if (chartType === "bar-grouped") {
            // chartData: { labels: [...], datasets: [{label, data: [...]}, ...] }
            config = {
                type: 'bar',
                data: {
                    labels: chartData.labels.map(label =>
                        typeof label === "string" && label.length > 12
                            ? label.replace(/(.{1,12})(\s|$)/g, '$1\n').trim()
                            : label
                    ),
                    datasets: chartData.datasets.map((ds, idx) => ({
                        ...ds,
                        backgroundColor: [
                            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
                        ][idx % 8],
                        borderRadius: 8,
                        barPercentage: 0.7,
                        categoryPercentage: 0.6,
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            font: { weight: 'bold', size: 14 },
                            color: '#22223b',
                            formatter: v => v > 0 ? v : '',
                        }
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: { enabled: true },
                        datalabels: {
                            display: true,
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: chartTitle.includes("TAT") ? "Month" : "" },
                            stacked: false,
                            ticks: {
                                font: { size: 12, weight: 'bold' },
                                color: '#374151',
                                maxRotation: 0, // Prevent rotation
                                minRotation: 0, // Prevent rotation
                                callback: function(value, index, values) {
                                    // This ensures multiline labels are rendered correctly
                                    const label = this.getLabelForValue(value);
                                    return label.split('\n');
                                }
                            },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: chartTitle.includes("TAT") ? "TAT Days" : "Sample Count" },
                            ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
                            grid: {
                                color: '#e5e7eb',
                                borderDash: [4, 4],
                                drawTicks: false,
                                drawBorder: false,
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        } else if (chartType === "funnel") {
            // ...your existing funnel config...
            config = {
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
                        datalabels: {
                            display: true,
                            color: '#22223b',
                            font: { weight: 'bold', size: 18 },
                            align: 'center',   // Center horizontally
                            clamp: true,
                            textStrokeColor: '#fff',
                            textStrokeWidth: 2,
                            formatter: function (value, context) {
                                const label = context.chart.data.labels[context.dataIndex];
                                if (label) {
                                    return `${label}: \n ${value} samples`;
                                }
                                // If no label, just return the value
                                return ` ${value}`;
                            }
                        }
                    },
                },
                plugins: [ChartDataLabels]
            };
        } else if (chartType === "line-grouped") {
            config = {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: chartData.datasets.map((ds, idx) => ({
                        ...ds,
                        borderColor: [
                            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
                        ][idx % 8],
                        backgroundColor: [
                            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
                        ][idx % 8] + '33',
                        borderWidth: 3,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: [
                            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
                        ][idx % 8],
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            font: { weight: 'bold', size: 14 },
                            color: '#22223b',
                            formatter: v => v > 0 ? v.toFixed(1) : '',
                        }
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: { enabled: true },
                        datalabels: { display: true }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "" },
                            ticks: { font: { size: 12, weight: 'bold' }, color: '#374151' },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: "TAT Days" },
                            ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
                            grid: {
                                color: '#e5e7eb',
                                borderDash: [4, 4],
                                drawTicks: false,
                                drawBorder: false,
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        }

        if (chartRef.current && config) {
            chartInstanceRef.current = new Chart(chartRef.current, config);
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData, chartType, chartTitle, chartHeight]);

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
                                    {dropdown.value && Array.isArray(dropdown.value) && dropdown.value.length > 0
                                        ? dropdown.value.join(', ')
                                        : dropdown.label}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[180px] max-w-xs whitespace-normal">
                                <DropdownMenuLabel>{dropdown.label}</DropdownMenuLabel>
                                <DropdownMenuItem
                                    key="__clear__"
                                    onSelect={() => dropdown.onChange([])}
                                    className={`whitespace-normal break-words ${dropdown.value && dropdown.value.length === 0 ? "font-bold bg-indigo-100 dark:bg-indigo-900" : ""}`}
                                >
                                    Clear
                                </DropdownMenuItem>
                                {dropdown.options.map(opt => (
                                    <DropdownMenuItem
                                        key={opt}
                                        onSelect={() => {
                                            let newValue = Array.isArray(dropdown.value) ? [...dropdown.value] : [];
                                            if (newValue.includes(opt)) {
                                                newValue = newValue.filter(v => v !== opt);
                                            } else {
                                                newValue.push(opt);
                                            }
                                            dropdown.onChange(newValue);
                                        }}
                                        className={`whitespace-normal break-words ${dropdown.value && dropdown.value.includes(opt) ? "font-bold bg-indigo-100 dark:bg-indigo-900" : ""}`}
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
                {/* {(!chartData || (Array.isArray(chartData.datasets) && chartData.datasets.every(ds => ds.data.every(v => v === 0)))) ? (
                    <span className="text-gray-400 text-lg">No data available for the selected filters.</span>
                ) : ( */}
                    <canvas ref={chartRef} className="!bg-transparent" />
                {/* )} */}
            </div>
        </div>
    );
};

export default DynamicChartDisplay;