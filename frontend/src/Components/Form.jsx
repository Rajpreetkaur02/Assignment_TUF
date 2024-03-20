import { useState } from "react";
import React from 'react'
import { useNavigate} from "react-router-dom";

const Form = () => {
    const [formData, setFormData] = useState({
        username: "",
        codelanguage: "Cpp",
        stdin: "",
        sourcecode: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            const response = await fetch('http://localhost:3001/codesnippet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if(response.ok){
                alert('Form submitted successfully');

                setFormData({
                    username: "",
                    codelanguage: "Cpp",
                    stdin: "",
                    sourcecode: "",
                });

                navigate('/page2');
            }else{
                alert('Failed to submit details');
            }
        }catch(error){
            console.error("Error submitting code snippet");
        }
        console.log(formData);
    }

    return (
        <div className="form-section">
            <h2>Enter Details</h2>
            <form onSubmit={handleSubmit} className="form-container">
                <label>Username: </label>
                <input type='text' name='username' value={formData.username} onChange={handleChange} required />
                <label>Preferred Code Language:</label>
                <select
                    name="codelanguage"
                    value={formData.codelanguage}
                    onChange={handleChange}
                    required
                >
                    <option value="Cpp">C++</option>
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                </select>
                <label>Standard Input (stdin):</label>
                <textarea
                    type="text"
                    name="stdin"
                    value={formData.stdin}
                    onChange={handleChange}
                />
                <label>Source Code:</label>
                <textarea
                    type="text"
                    name="sourcecode"
                    value={formData.sourcecode}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Submit Details</button>
            </form>
        </div>
    )
}

export default Form
