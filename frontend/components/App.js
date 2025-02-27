import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  const navigate = useNavigate()
  const redirectToLogin = () => navigate('/')
  const redirectToArticles = () => navigate('/articles')

  const logout = () => {
    if (localStorage) {
      localStorage.removeItem("token")
      setMessage("Goodbye!")
    }
    redirectToLogin()
  }

  const login = ({ username, password }) => {
    setMessage("")
    setSpinnerOn(true)
    axios.post(loginUrl, {username, password})
      .then(res => {
        localStorage.setItem("token", res.data.token)
        setMessage(res.data.message)
        redirectToArticles()
        setSpinnerOn(false)
      })
      .catch(err => console.log(err))
  }

  const getArticles = () => {
    !currentArticleId ? setMessage("") : null
    setSpinnerOn(true)
    axios.get(articlesUrl, {
      headers: {
        authorization: localStorage.getItem("token")
      }
    })
      .then(res => {
        !currentArticleId ? setMessage(res.data.message) : null
        setArticles(res.data.articles)
        setSpinnerOn(false)
      })
      .catch(err => console.log(err))
  }

  const postArticle = article => {
    setMessage("")
    setSpinnerOn(true)
    axios.post(articlesUrl, article, {
      headers: {
        authorization: localStorage.getItem("token")
      }
    })
      .then(res => {
        setCurrentArticleId()
        setMessage(res.data.message)
        setCurrentArticleId(null)
        axios.get(articlesUrl, {
          headers: {
            authorization: localStorage.getItem("token")
          }
        })
        .then(res => {
          setArticles(res.data.articles)
          setSpinnerOn(false)
        })
        .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }

  const updateArticle = ({ article_id, article }) => {
    article_id = currentArticleId
    setSpinnerOn(true)
    axios.put(`${articlesUrl}/${article_id}`, article, {
      headers: {
        authorization: localStorage.getItem("token")
      }
    })
    .then(res => {
      setMessage(res.data.message)
      setCurrentArticleId()
      getArticles()
      setSpinnerOn(false)
    })
    .catch(err => console.log(err))
  }

  const deleteArticle = article_id => {
    setSpinnerOn(true)
    axios.delete(`${articlesUrl}/${article_id}`, {
      headers: {
        authorization: localStorage.getItem("token")
      }
    })
      .then(res => {
        setMessage(res.data.message)
        axios.get(articlesUrl, {
          headers: {
            authorization: localStorage.getItem("token")
          }
        })
        .then(res => {
          setArticles(res.data.articles)
          setSpinnerOn(false)
        })
        .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
    // ✨ implement
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm 
                postArticle={postArticle} 
                currentArticleId={currentArticleId}
                setCurrentArticleId={setCurrentArticleId} 
                updateArticle={updateArticle}
                articles={articles}
              />
              <Articles 
                getArticles={getArticles} 
                articles={articles}
                deleteArticle={deleteArticle}
                setCurrentArticleId={setCurrentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
