import React from 'react';
import { useState } from 'react';
import './style/Form.css';

export default function Form() {
    const [name, setName] = useState('');
    const [nameError,setNameError] = useState(null); 
    const validateName = (name) =>{
        if(name.trim()===''){
            return 'Name is required'
        }
        return null;
    }
    const handleNameChange = (e) =>{
        setName(e.target.value);
   
    const error = validateName(e.target.value)
    setNameError(error);
    }

    const handleSubmit = (e) =>{
        e.preventDefault()
        const nameError = validateName(name);
        // const emailError = validateEmail(email);

        setNameError(nameError);
        // setEmailError(emailError);

        if(!nameError){
            console.log('Submitted',{name});
        }
    }

  return (

    <div class="wraper">
    <div class="form-container">
        <h2 class="form-header">Contact Form</h2>
        <div className='error'>
            
        </div>
        <form onSubmit={handleSubmit}>
            <div class="form-group">
                <label>Full name</label>
                <input type="text" placeholder="John Doe" value={name} onChange={handleNameChange} />
                {nameError && <span style={{color:'red'}}>{nameError}</span>}
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" placeholder="john@email.com" />
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="+94 77 000 0000" />
            </div>
            <button type="submit">Submit</button>
        </form>
    </div>
</div>
  );
}
