import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux"
import store from "./reducers/store"
import "./styles.css";

import WebFont from 'webfontloader';

WebFont.load({
    google: {
        families: ['Montserrat:300,400,700', 'Roboto Mono:300,400,700', 'sans-serif']
    }
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("container")
)