import React from "react";
import Head from "next/head";
import PropTypes from "prop-types";

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>Page Title</title>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, maximum-scale=3.0, minimum-scale=1.0, width=device-width"
        />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <div className={`page_section d-flex flex-column`}>
        <div className="main flex-grow-1">
          <Content />
        </div>
      </div>
    </div>
  );
}

// Content component consuming the context
function Content() {
  return <div>This is Sankalp Trust.</div>;
}

Home.propTypes = {
  children: PropTypes.any,
};
