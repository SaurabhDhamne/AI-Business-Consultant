import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Navbar, Container, Nav, Form, Button, Card, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";

function App() {
  const [field, setField] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          </Nav>
        </Container>
      </Navbar>

      <div className="hero-section text-center text-light py-5">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          Empower Your Business with AI Insights
        </motion.h1>
        <p>Get personalized business evaluation & insights with AI-driven recommendations.</p>
      </div>

      <Container className="mt-4">
        <Card className="p-4 shadow-lg">
          <Form>
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
              onClick={handleGenerateQuestions}
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
                <Form.Label><strong>Q{index + 1}:</strong> {q}</Form.Label>
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
              disabled={answers.some(ans => ans.trim() === "") || loading}
              className="w-100"
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Submit Answers"}
            </Button>
          </Card>
        )}
      </Container>

      {evaluation && (
        <Container className="mt-4">
          <Card className="p-4 shadow-lg">
            <h4>Evaluation Results</h4>
            {evaluation.scores.map((score, index) => (
              <p key={index}><strong>Q{index + 1}:</strong> {score}/10 - {evaluation.feedback[index]}</p>
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
    </div>
  );
}

export default App;
