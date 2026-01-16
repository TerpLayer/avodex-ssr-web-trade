import React from "react";
import { record } from "@az/acc";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = {
      hasError: false,
      errMsg: "",
    };
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true, errMsg: error.message };
  }
  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    // console.log({ error, errorInfo });
    try {
      const send = {
        ...(this.props.log || {}),
        t: "trade",
        filePath: "/components/app/ErrorBoundary.js",
        error,
        errorInfo,
      };
      record(send);
      console.log("record(", send);
    } catch (e) {
      console.error(e);
    }
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ height: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h2>Oops, there is an error!</h2>
          <p style={{ margin: "10px 0" }}>{this.state.errMsg}</p>
          <button type="button" onClick={() => this.setState({ hasError: false })}>
            Try again?
          </button>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
