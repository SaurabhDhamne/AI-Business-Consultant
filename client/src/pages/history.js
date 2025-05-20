import { useEffect, useState } from 'react';
import { supabase } from '../superbaseClient';

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("user_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setHistory(data);
    };
    fetchHistory();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Your Past Evaluations</h3>
      {history.map((entry, i) => (
        <div key={i} className="card mb-3 p-3 shadow-sm">
          <h5>Business Field: {entry.field}</h5>
          <p><strong>Answers:</strong> {entry.answers.join(", ")}</p>
          <p><strong>Scores:</strong> {entry.scores.join(", ")}</p>
          <p><strong>Rating:</strong> {entry.final_rating}/10</p>
          <p><strong>Feedback:</strong></p>
          <ul>
            {entry.feedback.map((fb, i) => <li key={i}>{fb}</li>)}
          </ul>
          <p><strong>Roadmap:</strong></p>
          <ul>
            {entry.roadmap.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
          <small className="text-muted">Created At: {new Date(entry.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default History;
