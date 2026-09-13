const {
    useState,
    useEffect,
    useMemo,
    useRef
} = React;


// ----------------------------
// CUSTOM REACT HOOK
// ----------------------------

function useFilteredData(
    data,
    search,
    category,
    region
) {

    return useMemo(() => {

        return data.filter((item) => {

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                item.product
                    .toLowerCase()
                    .includes(searchText) ||

                item.category
                    .toLowerCase()
                    .includes(searchText) ||

                item.region
                    .toLowerCase()
                    .includes(searchText);

            const matchesCategory =
                category === "All" ||
                item.category === category;

            const matchesRegion =
                region === "All" ||
                item.region === region;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesRegion
            );

        });

    }, [
        data,
        search,
        category,
        region
    ]);

}


// ----------------------------
// SUMMARY CARD
// ----------------------------

function SummaryCard({
    title,
    value,
    tooltip
}) {

    return (

        <div
            className="summary-card"
            title={tooltip}
            tabIndex="0"
        >

            <p>
                {title}
            </p>

            <h2>
                {value}
            </h2>

        </div>

    );

}


// ----------------------------
// BAR CHART
// ----------------------------

function RevenueBarChart({ data }) {

    const canvasRef =
        useRef(null);

    const chartRef =
        useRef(null);


    useEffect(() => {

        const categoryRevenue = {};


        data.forEach((item) => {

            if (
                !categoryRevenue[
                    item.category
                ]
            ) {

                categoryRevenue[
                    item.category
                ] = 0;

            }

            categoryRevenue[
                item.category
            ] += Number(
                item.revenue
            );

        });


        if (chartRef.current) {

            chartRef.current.destroy();

        }


        chartRef.current =
            new Chart(
                canvasRef.current,
                {

                    type: "bar",

                    data: {

                        labels:
                            Object.keys(
                                categoryRevenue
                            ),

                        datasets: [

                            {
                                label:
                                    "Revenue ₹",

                                data:
                                    Object.values(
                                        categoryRevenue
                                    ),

                                borderWidth: 1
                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        animation: {
                            duration: 900
                        },

                        plugins: {

                            tooltip: {
                                enabled: true
                            },

                            legend: {
                                display: true
                            }

                        }

                    }

                }
            );


        return () => {

            if (chartRef.current) {

                chartRef.current.destroy();

            }

        };


    }, [data]);


    return (

        <div className="chart-container">

            <h3>
                Revenue by Category
            </h3>

            <div className="chart-box">

                <canvas
                    ref={canvasRef}
                    aria-label=
                        "Revenue by category bar chart"
                >
                </canvas>

            </div>

        </div>

    );

}


// ----------------------------
// LINE CHART
// ----------------------------

function SalesLineChart({ data }) {

    const canvasRef =
        useRef(null);

    const chartRef =
        useRef(null);


    useEffect(() => {

        const monthlyRevenue = {};


        data.forEach((item) => {

            const date =
                new Date(item.date);

            const month =
                date.toLocaleString(
                    "default",
                    {
                        month: "short"
                    }
                );


            if (
                !monthlyRevenue[month]
            ) {

                monthlyRevenue[month] =
                    0;

            }


            monthlyRevenue[month] +=
                Number(
                    item.revenue
                );

        });


        if (chartRef.current) {

            chartRef.current.destroy();

        }


        chartRef.current =
            new Chart(
                canvasRef.current,
                {

                    type: "line",

                    data: {

                        labels:
                            Object.keys(
                                monthlyRevenue
                            ),

                        datasets: [

                            {
                                label:
                                    "Monthly Revenue ₹",

                                data:
                                    Object.values(
                                        monthlyRevenue
                                    ),

                                tension: 0.35,

                                fill: false
                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        animation: {
                            duration: 900
                        },

                        plugins: {

                            tooltip: {
                                enabled: true
                            }

                        }

                    }

                }
            );


        return () => {

            if (chartRef.current) {

                chartRef.current.destroy();

            }

        };


    }, [data]);


    return (

        <div className="chart-container">

            <h3>
                Monthly Revenue Trend
            </h3>

            <div className="chart-box">

                <canvas
                    ref={canvasRef}
                    aria-label=
                        "Monthly revenue line chart"
                >
                </canvas>

            </div>

        </div>

    );

}


// ----------------------------
// DATA TABLE
// ----------------------------

function DataTable({ data }) {

    return (

        <div className="table-section">

            <h3>
                Sales Records
            </h3>

            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>Date</th>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Region</th>
                            <th>Units</th>
                            <th>Revenue</th>

                        </tr>

                    </thead>

                    <tbody>

                        {data.map(
                            (item, index) => (

                                <tr key={index}>

                                    <td>
                                        {item.date}
                                    </td>

                                    <td>
                                        {item.product}
                                    </td>

                                    <td>
                                        {item.category}
                                    </td>

                                    <td>
                                        {item.region}
                                    </td>

                                    <td>
                                        {item.units}
                                    </td>

                                    <td>

                                        ₹
                                        {Number(
                                            item.revenue
                                        ).toLocaleString()}

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}


// ----------------------------
// MAIN DASHBOARD
// ----------------------------

function Dashboard() {

    const [data, setData] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("All");

    const [region, setRegion] =
        useState("All");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    useEffect(() => {

        try {

            setTimeout(() => {

                if (
                    !window.SALES_DATA ||
                    !Array.isArray(
                        window.SALES_DATA
                    )
                ) {

                    throw new Error(
                        "Sales data could not be loaded."
                    );

                }


                setData(
                    window.SALES_DATA
                );

                setLoading(false);

            }, 500);

        }

        catch (error) {

            setError(
                error.message
            );

            setLoading(false);

        }

    }, []);


    const categories =
        useMemo(
            () => [

                ...new Set(

                    data.map(
                        item =>
                            item.category
                    )

                )

            ],
            [data]
        );


    const regions =
        useMemo(
            () => [

                ...new Set(

                    data.map(
                        item =>
                            item.region
                    )

                )

            ],
            [data]
        );


    const filteredData =
        useFilteredData(
            data,
            search,
            category,
            region
        );


    const totalRevenue =
        filteredData.reduce(
            (total, item) =>

                total +
                Number(
                    item.revenue
                ),

            0
        );


    const totalUnits =
        filteredData.reduce(
            (total, item) =>

                total +
                Number(
                    item.units
                ),

            0
        );


    const averageRevenue =

        filteredData.length > 0

            ? totalRevenue /
                filteredData.length

            : 0;


    if (loading) {

        return (

            <div className="loading">

                <div className="spinner">
                </div>

                <h2>
                    Loading dashboard...
                </h2>

            </div>

        );

    }


    if (error) {

        return (

            <div
                className="error"
                role="alert"
            >

                <h2>
                    Unable to load dashboard
                </h2>

                <p>
                    {error}
                </p>

            </div>

        );

    }


    return (

        <main className="dashboard">

            <header>

                <h1>
                    📊 Product Sales Dashboard
                </h1>

                <p>
                    Interactive Sales Analytics
                    using ReactJS and Streamlit
                </p>

            </header>


            <section
                className="controls"
                aria-label=
                    "Dashboard filters"
            >


                <div
                    className=
                        "control-group"
                >

                    <label htmlFor="search">

                        Search Products

                    </label>

                    <input

                        id="search"

                        type="text"

                        placeholder=
                            "Search product, category or region..."

                        value={search}

                        onChange={
                            (event) =>
                                setSearch(
                                    event.target.value
                                )
                        }

                        aria-label=
                            "Search products"

                    />

                </div>


                <div
                    className=
                        "control-group"
                >

                    <label htmlFor="category">

                        Category

                    </label>


                    <select

                        id="category"

                        value={category}

                        onChange={
                            (event) =>
                                setCategory(
                                    event.target.value
                                )
                        }

                    >

                        <option value="All">

                            All Categories

                        </option>


                        {categories.map(
                            (item) => (

                                <option
                                    key={item}
                                    value={item}
                                >

                                    {item}

                                </option>

                            )
                        )}

                    </select>

                </div>


                <div
                    className=
                        "control-group"
                >

                    <label htmlFor="region">

                        Region

                    </label>


                    <select

                        id="region"

                        value={region}

                        onChange={
                            (event) =>
                                setRegion(
                                    event.target.value
                                )
                        }

                    >

                        <option value="All">

                            All Regions

                        </option>


                        {regions.map(
                            (item) => (

                                <option
                                    key={item}
                                    value={item}
                                >

                                    {item}

                                </option>

                            )
                        )}

                    </select>

                </div>


            </section>


            <section className="summary-grid">


                <SummaryCard

                    title=
                        "Total Revenue"

                    value={
                        "₹" +
                        totalRevenue
                            .toLocaleString()
                    }

                    tooltip=
                        "Total revenue after applying filters"

                />


                <SummaryCard

                    title=
                        "Units Sold"

                    value={
                        totalUnits
                            .toLocaleString()
                    }

                    tooltip=
                        "Total number of units sold"

                />


                <SummaryCard

                    title=
                        "Records"

                    value={
                        filteredData.length
                    }

                    tooltip=
                        "Number of matching sales records"

                />


                <SummaryCard

                    title=
                        "Average Revenue"

                    value={
                        "₹" +
                        Math.round(
                            averageRevenue
                        ).toLocaleString()
                    }

                    tooltip=
                        "Average revenue per sales record"

                />


            </section>


            {
                filteredData.length === 0

                ? (

                    <div className="no-results">

                        <h3>
                            No results found
                        </h3>

                        <p>
                            Try another search
                            or change the filters.
                        </p>

                    </div>

                )

                : (

                    <>

                        <section
                            className=
                                "charts-grid"
                        >

                            <RevenueBarChart
                                data={
                                    filteredData
                                }
                            />

                            <SalesLineChart
                                data={
                                    filteredData
                                }
                            />

                        </section>


                        <DataTable
                            data={
                                filteredData
                            }
                        />

                    </>

                )
            }

        </main>

    );

}


const root =
    ReactDOM.createRoot(
        document.getElementById(
            "root"
        )
    );


root.render(
    <Dashboard />
);