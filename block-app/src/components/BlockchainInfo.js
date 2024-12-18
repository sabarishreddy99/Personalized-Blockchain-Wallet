
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";
import "./BlockchainInfo.css";


function CryptoLineChartWithTable() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef();
  const navigate = useNavigate();

  const fetchCryptos = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = "https://api.coingecko.com/api/v3/coins/markets";
      const params = {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 8,
        page: 1,
        sparkline: true,
        price_change_percentage: "24h"
      };

      const response = await axios.get(url, { params });
      setCryptos(response.data);
    } catch (err) {
      console.error("Failed to fetch cryptocurrency data:", err);
      setError("Failed to fetch cryptocurrency data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(() => {
      fetchCryptos(); // Fetch new data every X seconds
    }, 30000); // 30 seconds interval
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const renderLineChart = () => {
    if (!cryptos || cryptos.length === 0) return;

    const width = document.querySelector(".chart-container").clientWidth;
    const height = 500;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#f9f9f9");

    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract and prepare data
    const allData = cryptos.map((crypto) =>
      crypto.sparkline_in_7d.price.slice(0, 24).map((price, index) => ({
        time: index,
        price,
        name: crypto.name
      }))
    );

    const flattenedData = allData.flat();

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 23])
      .range([0, innerWidth]);
      

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(flattenedData, (d) => d.price)])
      .range([innerHeight, 0]);

    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(24).tickSize(-innerHeight).tickFormat(""));

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).ticks(10).tickSize(-innerWidth).tickFormat(""));

    // Create line generator
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // Draw lines
    allData.forEach((cryptoData, index) => {
      g.append("path")
        .datum(cryptoData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d3.schemeCategory10[index % 10])
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);
    });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(24))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 35)
      .attr("x", innerWidth / 2)
      .text("Hour of the Day");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("text-anchor", "end")
      .text("Price (USD)");

    // Add legend
    const legend = g
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("g")
      .data(cryptos)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${innerWidth + 10},${i * 20})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text((d) => d.name);

    // Add tooltip
    const tooltip = d3
      .select(".chart-container")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Add vertical line for hover
    const verticalLine = g
      .append("line")
      .attr("class", "vertical-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .style("opacity", 0);

    // Add overlay for mouse tracking
    const overlay = g
      .append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("opacity", 0);

    overlay
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const hoveredHour = Math.round(xScale.invert(mouseX));
        
        verticalLine
          .attr("x1", xScale(hoveredHour))
          .attr("x2", xScale(hoveredHour))
          .style("opacity", 1);

        const tooltipContent = cryptos.map((crypto, i) => {
          const price = crypto.sparkline_in_7d.price[hoveredHour];
          return `<div style="color:${d3.schemeCategory10[i % 10]}">${crypto.name}: $${price.toFixed(2)}</div>`;
        }).join("");

        const currentDate = new Date();
        currentDate.setHours(hoveredHour);
        
        tooltip
          .style("opacity", 1)
          .html(
            `<div class="tooltip-content">
              <div>Time: ${currentDate.toLocaleTimeString()}</div>
              <div>Date: ${currentDate.toLocaleDateString()}</div>
              ${tooltipContent}
            </div>`
          )
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 15}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
        verticalLine.style("opacity", 0);
      });
  };

  useEffect(() => {
    renderLineChart();
  }, [cryptos]);

  useEffect(() => {
    const handleResize = () => {
      renderLineChart();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cryptos]);

  return (
    <div className="container">
      <h1 className="header">
        Cryptocurrency Market Overview (24h)
        <button className="navigate-wallet" onClick={() => navigate("/wallet")}>
          Go to Wallet
        </button>
        
        <button className="refresh-button" onClick={fetchCryptos}>
          Refresh Data
        </button>
        
      </h1>

      <div className="content">
        <div className="chart-container">
          {error && <p className="error">{error}</p>}
          {loading && <p>Loading cryptocurrency data...</p>}
          {!loading && cryptos.length > 0 ? (
            <svg ref={chartRef}></svg>
          ) : (
            !loading && <p>No cryptocurrency data available.</p>
          )}
        </div>

        <div className="table-container">
          {cryptos.length > 0 ? (
            <table className="crypto-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>24h Change</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map((crypto, index) => (
                  <tr key={crypto.id}>
                    <td>{index + 1}</td>
                    <td>{crypto.name}</td>
                    <td>{crypto.symbol.toUpperCase()}</td>
                    <td>${crypto.current_price.toLocaleString()}</td>
                    <td style={{color: crypto.price_change_percentage_24h >= 0 ? 'green' : 'red'}}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !error && <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CryptoLineChartWithTable;
