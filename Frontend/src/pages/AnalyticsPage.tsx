import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

type QuestionType = "YES_NO" | "RATING" | "TEXT" | string;

type YesNoAnalysis = { yes: number; no: number; unanswered: number };
type RatingAnalysis = {
  average: string | null;
  min: number | null;
  max: number | null;
  distribution: { [key: string]: number };
};
type TextAnalysis = { count: number; responses: string[] };

type Question = {
  questionId: string;
  text: string;
  type: QuestionType;
  totalAnswers: number;
  analysis: YesNoAnalysis | RatingAnalysis | TextAnalysis | { message: string };
};

type AnalyticsResponse = {
  sessionId: string;
  sessionTitle: string;
  questionCount: number;
  questions: Question[];
};

interface QuestionAnalysisProps {
  question: Question;
}

const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({ question }) => {
  const { type, analysis, text } = question;

  if (type === "YES_NO") {
    const yesNoAnalysis = analysis as YesNoAnalysis;
    const data = [
      { name: "Yes", value: yesNoAnalysis.yes },
      { name: "No", value: yesNoAnalysis.no },
      // { name: "Unanswered", value: yesNoAnalysis.unanswered }
    ];
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-100 p-6 rounded-3xl shadow-lg mb-8 border border-blue-200">
        <h3 className="text-xl font-bold mb-4 text-blue-900 tracking-wide">{text}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fill: '#4B5563', fontWeight: 'bold' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#4B5563', fontWeight: 'bold' }} />
            <Tooltip wrapperStyle={{ backgroundColor: '#f3f4f6', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ color: '#6366f1' }} />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "RATING") {
    const ratingAnalysis = analysis as RatingAnalysis;
    const distributionData = Object.entries(ratingAnalysis.distribution || {}).map(([key, val]) => ({
      name: key,
      value: val
    }));
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-100 p-6 rounded-3xl shadow-lg mb-8 border border-green-200">
        <h3 className="text-xl font-bold mb-4 text-green-900 tracking-wide">{text}</h3>
        <div className="flex flex-wrap gap-6 mb-4">
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold shadow">
            Average: {ratingAnalysis.average !== null ? parseFloat(ratingAnalysis.average).toFixed(2) : "N/A"}
          </span>
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow">
            Min: {ratingAnalysis.min ?? "N/A"}
          </span>
          <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold shadow">
            Max: {ratingAnalysis.max ?? "N/A"}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={distributionData}>
            <XAxis dataKey="name" tick={{ fill: '#065f46', fontWeight: 'bold' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#065f46', fontWeight: 'bold' }} />
            <Tooltip wrapperStyle={{ backgroundColor: '#e0f2fe', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ color: '#10b981' }} />
            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "TEXT") {
    const textAnalysis = analysis as TextAnalysis;
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-pink-100 p-6 rounded-3xl shadow-lg mb-8 border border-yellow-200">
        <h3 className="text-xl font-bold mb-4 text-yellow-900 tracking-wide">{text}</h3>
        <p className="mb-4 text-pink-800 font-semibold">Total Responses: {textAnalysis.count}</p>
        <ul className="list-disc list-inside space-y-2 max-h-64 overflow-y-auto pr-2">
          {Array.isArray(textAnalysis.responses)
            ? textAnalysis.responses.map((resp: string, index: number) => (
                <li
                  key={index}
                  className="bg-white rounded-lg px-4 py-2 shadow text-gray-700 break-words whitespace-pre-line overflow-x-auto"
                  style={{ wordBreak: 'break-word', maxWidth: '100%' }}
                >
                  {resp}
                </li>
              ))
            : null}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-8 border border-red-200 font-semibold">
      Unsupported question type: {type}
    </div>
  );
};

interface FeedbackDashboardProps {
  sessionId: string;
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ sessionId }) => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/analytics/sessions/${sessionId}/questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json: AnalyticsResponse = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <span className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></span>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-10 text-red-500 font-bold text-lg">{error}</div>
    );

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-4 text-blue-800 tracking-wide">
          Session: {data.sessionTitle}
        </h1>
        <p className="mb-2 text-gray-500 text-lg">
          Total Questions: <span className="font-bold text-blue-600">{data.questionCount}</span>
        </p>
      </div>
      <div className="space-y-8">
        {data.questions.map((q) => (
          <QuestionAnalysis key={q.questionId} question={q} />
        ))}
      </div>
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (!sessionId)
    return (
      <div className="text-center mt-10 text-red-500 font-bold text-lg">
        Session ID not found in URL.
      </div>
    );
  return <FeedbackDashboard sessionId={sessionId} />;
};

export default AnalyticsPage;
