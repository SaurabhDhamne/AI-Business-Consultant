import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  Navbar,
  Container,
  Nav,
  Form,
  Button,
  Card,
  Spinner,
  Row,
  Col,
  Carousel
} from "react-bootstrap";
import { motion } from "framer-motion";
import { supabase } from "./superbaseClient";
import Login from "./pages/Login";
import smileimg from "./Entrepreneurship-img.jpg"

function App() {
  const [user, setUser] = useState(null);
  const [field, setField] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check user session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setEvaluation(null);

    try {
      const response = await fetch("http://localhost:5000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });

      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data.questions || []);
      setAnswers(["", "", "", ""]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswers = async () => {
    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      const response = await fetch("http://localhost:5000/evaluate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, answers }),
      });

      if (!response.ok) throw new Error("Failed to evaluate answers");
      const data = await response.json();
      setEvaluation(data);

      // Save to Supabase
      await supabase.from("user_history").insert([
        {
          user_id: user.id,
          field,
          questions,
          answers,
          score: data.final_rating,
          roadmap: data.roadmap,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">AI Business Consultant</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#benefits">Benefits</Nav.Link>
            <Nav.Link href="#contact">Contact</Nav.Link>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <div className="hero-section text-center text-light py-5">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Empower Your Business with AI Insights
        </motion.h1>
        <p>
          Get personalized business evaluation & insights with AI-driven
          recommendations.
        </p>
      </div>

      <Container className="mt-4">
        <Card className="p-4 shadow-lg">
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleGenerateQuestions(); // Call your existing function
          }}>
            <Form.Group className="mb-4">
              <Form.Label>Enter your business field:</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., E-commerce, SaaS, Retail"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={!field || loading}
              className="w-100"
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Get Questions"}
            </Button>
          </Form>
        </Card>
      </Container>

      <Container className="mt-4">
        {questions.length > 0 && (
          <Card className="p-4 shadow-lg">
            <h4>Generated Questions</h4>
            {questions.map((q, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label>
                  <strong>Q{index + 1}:</strong> {q}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={answers[index]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  placeholder="Your answer..."
                />
              </Form.Group>
            ))}
            <Button
              variant="success"
              onClick={handleEvaluateAnswers}
              disabled={answers.some((ans) => ans.trim() === "") || loading}
              className="w-100"
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Submit Answers"}
            </Button>
          </Card>
        )}
      </Container>
        <Container className="my-5">
  <Row className="align-items-center">
    <Col md={6}>
      <img
        src={smileimg}
        alt="AI Insights"
        className="img-fluid rounded shadow"
      />
    </Col>
    <Col md={6}>
      <h3>Real-Time Business Insights</h3>
      <p className="lead">
        Our AI continuously learns from your inputs to deliver actionable insights
        and performance evaluations tailored to your business goals.
      </p>
      <ul>
        <li>Instant feedback on strategic decisions</li>
        <li>Adaptable to various industries</li>
        <li>Built-in performance tracking</li>
      </ul>
    </Col>
  </Row>
</Container>


      {evaluation && (
        <Container className="mt-4">
          <Card className="p-4 shadow-lg">
            <h4>Evaluation Results</h4>
            {evaluation.scores.map((score, index) => (
              <p key={index}>
                <strong>Q{index + 1}:</strong> {score}/10 -{" "}
                {evaluation.feedback[index]}
              </p>
            ))}
            <h5>Final Rating: {evaluation.final_rating}/10</h5>
            {evaluation.roadmap && (
              <>
                <h5 className="mt-3">Next Steps (Roadmap)</h5>
                <ul>
                  {evaluation.roadmap.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </Container>
      )}

      {/* Footer Section - Appears after scrolling */}
     <footer className="bg-dark text-light py-4 mt-auto w-100">
  <Container>
    <Row>
      <Col md={6}>
        <h5>AI Business Consultant</h5>
        <p>Your AI-powered business insights and evaluation tool.</p>
      </Col>
      <Col md={6} className="text-md-end">
        <p>&copy; 2025 AI Business Consultant. All rights reserved.</p>
      </Col>
    </Row>
  </Container>
</footer>

    </div>
  );
}
    
export default App;
