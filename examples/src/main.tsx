import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Demo from "./Demo";
import "./index.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/demo",
        element: <Demo />,
    },
    {
        path: "*",
        element: <App />
    },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
