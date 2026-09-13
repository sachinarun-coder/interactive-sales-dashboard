import json
from pathlib import Path
from datetime import date
import pandas as pd
import streamlit as st
import streamlit.components.v1 as components
# -------------------------------------------------
# PAGE SETTINGS
# -------------------------------------------------
st.set_page_config(
    page_title="Product Sales Dashboard",
    page_icon="📊",
    layout="wide"
)


# -------------------------------------------------
# FILE PATHS
# -------------------------------------------------

BASE_DIR = Path(__file__).parent

DATA_FILE = (
    BASE_DIR
    / "data"
    / "products.csv"
)

FRONTEND_DIR = (
    BASE_DIR
    / "frontend"
)


# -------------------------------------------------
# LOAD DATA
# -------------------------------------------------

def load_data():

    df = pd.read_csv(DATA_FILE)

    required_columns = {
        "date",
        "product",
        "category",
        "region",
        "units",
        "unit_price",
        "revenue"
    }

    missing_columns = (
        required_columns
        - set(df.columns)
    )

    if missing_columns:

        raise ValueError(
            "Missing columns: "
            + ", ".join(missing_columns)
        )

    return df


# -------------------------------------------------
# LOAD DATA INTO SESSION STATE
# -------------------------------------------------

if "sales_data" not in st.session_state:

    try:

        st.session_state.sales_data = (
            load_data()
        )

    except Exception:

        st.session_state.sales_data = (
            pd.DataFrame(
                columns=[
                    "date",
                    "product",
                    "category",
                    "region",
                    "units",
                    "unit_price",
                    "revenue"
                ]
            )
        )


# -------------------------------------------------
# CREATE REACT DASHBOARD
# -------------------------------------------------

def create_dashboard(data):

    html = (
        FRONTEND_DIR
        / "index_template.html"
    ).read_text(
        encoding="utf-8"
    )

    css = (
        FRONTEND_DIR
        / "styles.css"
    ).read_text(
        encoding="utf-8"
    )

    jsx = (
        FRONTEND_DIR
        / "dashboard.jsx"
    ).read_text(
        encoding="utf-8"
    )

    html = html.replace(
        "/*__CSS__*/",
        css
    )

    html = html.replace(
        "//__DATA__",
        "window.SALES_DATA = "
        + json.dumps(data)
        + ";"
    )

    html = html.replace(
        "/*__JSX__*/",
        jsx
    )

    return html


# -------------------------------------------------
# TITLE
# -------------------------------------------------

st.title(
    "📊 Interactive Product Sales Dashboard"
)

st.caption(
    "Frontend Intern Coding Challenge – ReactJS + Streamlit"
)

st.write(
    "Enter a new sales record below. "
    "The dashboard will update automatically."
)


# -------------------------------------------------
# USER INPUT FORM
# -------------------------------------------------

st.subheader(
    "➕ Add New Sales Record"
)


with st.form(
    "sales_form",
    clear_on_submit=True
):

    col1, col2, col3 = st.columns(3)


    # DATE

    with col1:

        sale_date = st.date_input(
            "Sale Date",
            value=date.today()
        )


    # PRODUCT

    with col2:

        product = st.text_input(
            "Product Name",
            placeholder="Example: Laptop"
        )


    # CATEGORY

    with col3:

        category = st.selectbox(
            "Category",
            [
                "Electronics",
                "Accessories",
                "Furniture",
                "Other"
            ]
        )


    col4, col5, col6 = st.columns(3)


    # REGION

    with col4:

        region = st.selectbox(
            "Region",
            [
                "North",
                "South",
                "East",
                "West"
            ]
        )


    # UNITS

    with col5:

        units = st.number_input(
            "Units Sold",
            min_value=1,
            value=1,
            step=1
        )


    # PRICE

    with col6:

        unit_price = st.number_input(
            "Unit Price ₹",
            min_value=1.0,
            value=1000.0,
            step=100.0
        )


    # AUTOMATIC REVENUE

    revenue = (
        units
        * unit_price
    )


    st.info(
        f"Calculated Revenue: "
        f"₹{revenue:,.2f}"
    )


    submit_button = st.form_submit_button(
        "➕ Add Sales Record",
        use_container_width=True
    )


# -------------------------------------------------
# ADD USER DATA
# -------------------------------------------------

if submit_button:

    if product.strip() == "":

        st.error(
            "Please enter a product name."
        )

    else:

        new_record = pd.DataFrame(
            [
                {
                    "date":
                        sale_date.strftime(
                            "%Y-%m-%d"
                        ),

                    "product":
                        product.strip(),

                    "category":
                        category,

                    "region":
                        region,

                    "units":
                        int(units),

                    "unit_price":
                        float(unit_price),

                    "revenue":
                        float(revenue)
                }
            ]
        )


        st.session_state.sales_data = (
            pd.concat(
                [
                    st.session_state.sales_data,
                    new_record
                ],
                ignore_index=True
            )
        )


        # SAVE NEW RECORD TO CSV

        st.session_state.sales_data.to_csv(
            DATA_FILE,
            index=False
        )


        st.success(
            f"✅ {product} record added successfully!"
        )


# -------------------------------------------------
# CURRENT DATA
# -------------------------------------------------

df = st.session_state.sales_data


# -------------------------------------------------
# STREAMLIT SUMMARY
# -------------------------------------------------

st.divider()

st.subheader(
    "📈 Current Sales Summary"
)


if not df.empty:

    total_revenue = (
        pd.to_numeric(
            df["revenue"]
        ).sum()
    )

    total_units = (
        pd.to_numeric(
            df["units"]
        ).sum()
    )

    total_records = len(df)


    c1, c2, c3 = st.columns(3)


    with c1:

        st.metric(
            "Total Revenue",
            f"₹{total_revenue:,.2f}"
        )


    with c2:

        st.metric(
            "Units Sold",
            f"{total_units:,.0f}"
        )


    with c3:

        st.metric(
            "Total Records",
            total_records
        )


# -------------------------------------------------
# SHOW RECENT DATA
# -------------------------------------------------

with st.expander(
    "📋 View Current Sales Data"
):

    st.dataframe(
        df,
        use_container_width=True
    )


# -------------------------------------------------
# RESET OPTION
# -------------------------------------------------

with st.expander(
    "⚙️ Dashboard Options"
):

    st.write(
        "Use this button only if you want "
        "to reload data from products.csv."
    )

    if st.button(
        "🔄 Reload CSV Data"
    ):

        st.session_state.sales_data = (
            load_data()
        )

        st.success(
            "CSV data reloaded."
        )

        st.rerun()


# -------------------------------------------------
# REACT DASHBOARD
# -------------------------------------------------

st.divider()

st.subheader(
    "📊 Interactive Analytics"
)


try:

    if df.empty:

        st.warning(
            "No sales records are available."
        )

    else:

        dashboard_html = (
            create_dashboard(
                df.to_dict(
                    orient="records"
                )
            )
        )

        components.html(
            dashboard_html,
            height=1100,
            scrolling=True
        )


except FileNotFoundError as error:

    st.error(
        f"Required file not found: {error}"
    )


except Exception as error:

    st.error(
        f"Something went wrong: {error}"
    )
