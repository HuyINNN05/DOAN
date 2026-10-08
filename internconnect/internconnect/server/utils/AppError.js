export class AppError extends Error {
  constructor(status, code, message, details) { super(message); Object.assign(this, { status, code, details }) }
}
