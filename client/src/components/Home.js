import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import Logout from "./Logout";
import axios from "axios";
import Resume from "./Resume";

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL_LOCAL;
  }
  return process.env.REACT_APP_API_URL_DEPLOYED;
};

const createResume = async (formData) => {
  const url = `${getApiUrl()}/resume/create`;
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
};

const Home = ({token, setResult }) => {
  const [fullName, setFullName] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [currentLength, setCurrentLength] = useState(1);
  const [currentTechnologies, setCurrentTechnologies] = useState("");
  const [headshot, setHeadshot] = useState(null);
  const [companyInfo, setCompanyInfo] = useState([{ name: "", position: "" }]);
  const [loading, setLoading] = useState(false);
  const [email, setemail] = useState(null);
  const navigate = useNavigate();

  const handleAddCompany = () => setCompanyInfo([...companyInfo, { name: "", position: "" }]);

  const handleRemoveCompany = (index) => {
    const list = [...companyInfo];
    list.splice(index, 1);
    setCompanyInfo(list);
  };

  const handleUpdateCompany = (e, index) => {
    const { name, value } = e.target;
    const list = [...companyInfo];
    list[index][name] = value;
    setCompanyInfo(list);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("headshotImage", headshot, headshot.name);
    formData.append("fullName", fullName);
    formData.append("currentPosition", currentPosition);
    formData.append("currentLength", currentLength);
    formData.append("currentTechnologies", currentTechnologies);
    formData.append("workHistory", JSON.stringify(companyInfo));

    try {
      const data = await createResume(formData);
      if (data.message) {
        setResult(data.data);
        navigate("/resume");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  const fetchUserId = async () => {
    try {
      // Check if token is available in local storage before making the request
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${getApiUrl()}/api/auth/current`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserId(response.data.email);
        
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  fetchUserId();
}, []);



  if (loading) {
    return <Loading />;
  }

  return (
    <div className='app'>
      <Logout />
      <h1>AI Resume Builder</h1>
      <p>Generate a resume with AI in a few seconds</p>
      <form onSubmit={handleFormSubmit} method='POST' encType='multipart/form-data'>
        <label htmlFor='fullName'>Enter your full name</label>
        <input
          type='text'
          required
          name='fullName'
          id='fullName'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <div className='nestedContainer'>
          <div>
            <label htmlFor='currentPosition'>Current Position</label>
            <input
              type='text'
              required
              name='currentPosition'
              className='currentInput'
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor='currentLength'>For how long? (year)</label>
            <input
              type='number'
              required
              name='currentLength'
              className='currentInput'
              value={currentLength}
              onChange={(e) => setCurrentLength(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor='currentTechnologies'>Technologies used</label>
            <input
              type='text'
              required
              name='currentTechnologies'
              className='currentInput'
              value={currentTechnologies}
              onChange={(e) => setCurrentTechnologies(e.target.value)}
            />
          </div>
        </div>
        <label htmlFor='photo'>Upload your headshot image</label>
        <input
          type='file'
          name='photo'
          required
          id='photo'
          accept='image/x-png,image/jpeg'
          onChange={(e) => setHeadshot(e.target.files[0])}
        />
        <h3>Companies you've worked at</h3>
        {companyInfo.map((company, index) => (
          <div className='nestedContainer' key={index}>
            <div className='companies'>
              <label htmlFor='name'>Company Name</label>
              <input
                type='text'
                name='name'
                required
                value={company.name}
                onChange={(e) => handleUpdateCompany(e, index)}
              />
            </div>
            <div className='companies'>
              <label htmlFor='position'>Position Held</label>
              <input
                type='text'
                name='position'
                required
                value={company.position}
                onChange={(e) => handleUpdateCompany(e, index)}
              />
            </div>
            <div className='btn__group'>
              {companyInfo.length - 1 === index && companyInfo.length < 4 && (
                <button type='button' id='addBtn' onClick={handleAddCompany}>
                  Add
                </button>
              )}
              {companyInfo.length > 1 && (
                <button
                  type='button'
                  id='deleteBtn'
                  onClick={() => handleRemoveCompany(index)}
                >
                  Del
                </button>
              )}
            </div>
          </div>
        ))}
        <button type='submit'>CREATE RESUME</button>
      </form>
      {email && <Resume email={email} />}
    </div>
  );
};

export default Home;
