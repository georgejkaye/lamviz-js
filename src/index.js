import React from "react"
import ReactDOM from "react-dom"
import { Provider } from 'react-redux'

import App from "./ts/App"
import store from './ts/redux/store'

import "./styles.scss"

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)