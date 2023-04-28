import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./pages";

function App(props: any) {

    return (
        <>
            <Home />
        </>
    )
}

const root = ReactDOM.createRoot(document.querySelector("#app")!)
root.render(<App />);
