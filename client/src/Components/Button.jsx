import React from "react";

const Button = (props) => {
    return <button onClick={() => window.location = props.route} className="btn btn-dark mr-3 mt-3"> {props.content} </button>
}

export default Button;