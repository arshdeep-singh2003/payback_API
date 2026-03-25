export default function IOUList({ ious, navigate, type }) {
  return (
    <div className="list-group">
      {ious && ious.length > 0 ? (
        ious.map(iou => (
          <button 
            key={iou.iou_id}
            className="list-group-item list-group-item-action"
            onClick={() => navigate(`/iou/${iou.iou_id}`)}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-1">{iou.reason}</h6>
                <small className="text-muted">
                  {type === 'lender' ? `from ${iou.borrower_name}` : `owed to ${iou.lender_name}`}
                </small>
              </div>
              <div className="text-end">
                <p className="mb-0"><strong>${iou.remaining_balance}</strong></p>
                <small className={iou.status === 'Paid' ? 'text-success' : 'text-warning'}>
                  {iou.status}
                </small>
              </div>
            </div>
          </button>
        ))
      ) : (
        <p className="text-muted">No IOUs</p>
      )}
    </div>
  )
}
