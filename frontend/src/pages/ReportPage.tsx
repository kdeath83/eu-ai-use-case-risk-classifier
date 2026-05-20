import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../components/Layout';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Reports are not persisted server-side yet.
    // Redirect to start a new assessment.
    console.warn(`Report lookup by ID not yet implemented (requested: ${id}). Redirecting to assessment.`);
    navigate('/assess', { replace: true });
  }, [id, navigate]);

  return (
    <Layout>
      <div className="card text-center">
        <p>Loading report...</p>
      </div>
    </Layout>
  );
}
