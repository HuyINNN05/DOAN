// Use with the fixed applications alias `a` in role-owned queries.
export const applicationOutcomeColumns = `
  (SELECT i.result FROM interviews i WHERE i.application_id=a.id ORDER BY i.id DESC LIMIT 1) interview_result,
  (SELECT CASE WHEN e.action='OFFER_DECLINED' THEN 'declined' ELSE 'accepted' END FROM application_events e
    WHERE e.application_id=a.id AND e.action IN ('OFFER_DECLINED','OFFER_ACCEPTED') ORDER BY e.id DESC LIMIT 1) offer_decision`
