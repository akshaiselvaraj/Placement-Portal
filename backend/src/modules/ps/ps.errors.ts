import { ApiError } from '../../utils/api-error';
import { PS_MESSAGES } from './ps.constants';

export class PSNotConnectedError extends ApiError {
  constructor(message = PS_MESSAGES.NOT_CONNECTED) {
    super(400, message);
    Object.setPrototypeOf(this, PSNotConnectedError.prototype);
  }
}

export class PSValidationError extends ApiError {
  constructor(message = PS_MESSAGES.VALIDATION_FAILED, errors: Record<string, string[]> = {}) {
    super(400, message, errors);
    Object.setPrototypeOf(this, PSValidationError.prototype);
  }
}

export class SyncFailedError extends ApiError {
  constructor(message = PS_MESSAGES.SYNC_FAILED) {
    super(500, message);
    Object.setPrototypeOf(this, SyncFailedError.prototype);
  }
}
