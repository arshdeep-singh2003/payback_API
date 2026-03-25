export default function IOUList({ ious, navigate, type }) {
  return (
    <div className="list-group">
      {ious && ious.length > 0 ? (
        ious.map(iou => (
          <button 
            key={iou.iou_id}
            className="list-group-item list-group-item-action border-start border-4 ps-3"
            onClick={() => navigate(`/iou/${iou.iou_id}`)}
            style={{
              borderLeftColor: iou.status === 'Paid' ? '#28a745' : '#ffc107',
              backgroundColor: iou.status === 'Paid' ? '#e8f5e9' : '#fff'
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="text-start flex-grow-1">
                <h6 className="mb-1 fw-bold">{iou.reason}</h6>
                <small className="text-muted">
                  {type === 'lender' ? `from ${iou.borrower_name}` : `owed to ${iou.lender_name}`}
                </small>
              </div>
              <div className="text-end">
                <p className="mb-1"><strong className="fs-5">${iou.remaining_balance}</strong></p>
                <span className={`badge ${iou.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {iou.status}
                </span>
              </div>
            </div>
          </button>
        ))
      ) : (
        <div className="text-center text-muted py-5">
          <p>No IOUs</p>
        </div>
      )}
    </div>
  )
}
