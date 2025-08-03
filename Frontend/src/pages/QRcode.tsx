import { useParams, useNavigate } from 'react-router-dom'

const QRcode = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const feedbackUrl = `${window.location.origin}/feedback/${sessionId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(feedbackUrl)}`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback QR Code</h2>
        <img src={qrUrl} alt="QR Code" className="mb-6 border-4 border-blue-100 rounded-lg" />
        <div className="mb-4 text-center">
          <div className="text-gray-700 text-sm mb-2">Scan this QR code to open the feedback form:</div>
          <input
            type="text"
            value={feedbackUrl}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-center text-xs text-gray-600 mb-2"
          />
        </div>
        <button
          onClick={() => navigate(`/feedback/${sessionId}`)}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors duration-200"
        >
          Go to Feedback Form
        </button>
      </div>
    </div>
  )
}

export default QRcode
