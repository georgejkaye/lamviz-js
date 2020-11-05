export const stylesheet = [
    {
        "selector": "node",
        "style": {
            "background-color": "black",
            "height": "1",
            "width": "1",
            "label": "",
            "font-size": 2,
            "overlay-padding": 0.5
        }
    },
    {
        "selector": ".abstraction",
        "style": {
            "background-color": "#00D9FF",
            "height": "2",
            "width": "2",
            "border-color": "black",
            "border-width": 0.25
        }
    },

    {
        "selector": ".application",
        "style": {
            "background-color": "#cd5c5c",
            "width": "2",
            "height": "2",
            "border-color": "black",
            "border-width": 0.25
        }
    },

    {
        "selector": ".midpoint",
        "style": {
            "background-color": "black",
            "width": "0.75",
            "height": "0.75"
        }
    },

    {
        "selector": ".support",
        "style": {
            "background-color": "black",
            "shape": "round-rectangle",
            "width": "1",
            "height": "1"
        }
    },
    {
        "selector": ".top",
        "style": {
            "background-color": "black",
            "shape": "round-rectangle",
            "width": "1",
            "height": "1"
        }
    },
    {
        "selector": "edge",
        "style": {
            "line-color": "black",
            "label": "data(label)",
            "width": "0.5",
            "overlay-padding": 0.5
        }
    },
    {
        selector: ".arc",
        style: {
            "curve-style": "unbundled-bezier",
            "control-point-distances": function (ele) {

                var source = ele.source();
                var target = ele.target();

                var diff = source.position("x") - target.position("x");

                return diff / 2;

            },
            "control-point-weights": "0.5",
            "loop-direction": "45deg",
            "source-endpoint": "0 0",
            "target-endpoint": "0 0"

        }
    },
    {
        selector: ".alert",
        style: {
            "background-color": "red",
            "line-color": "red"
        }
    }
]