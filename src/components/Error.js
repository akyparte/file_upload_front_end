import '../App.css';
import '../Error.css';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Error() {
   let navigate = useNavigate();
   const error_status = useSelector((state) => state.error.value)

   useEffect(() => {
      if (!error_status) {
         navigate('/')
      }
   }, [])
   return (<div className='error-frame'>
      <h1 className='err-heading'> 501 </h1>
      <div className='error-message'> WE ARE SORRY! INTERNAL SERVER ERROR OCCURED </div>
      <br></br>
      <div> REFRESH PAGE AGAIN, STILL ERROR OCCURES HEAD BACK LATER</div>
   </div>);
}

export default Error;
