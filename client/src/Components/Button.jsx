import React from "react";

/** 
 * @param {Object} props 
 * @returns Button Component
 */
const Button = (props) => {
    return <button onClick={() => window.location = props.route} className="btn btn-dark mr-3 mt-3"> {props.content} </button>
}

export default Button;