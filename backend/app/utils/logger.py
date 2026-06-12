import logging
import json
import sys
import uuid
from datetime import datetime
from contextvars import ContextVar

# Context var for tracking correlation ID across async execution
correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "correlation_id": correlation_id.get()
        }
        
        # Add any extra attributes passed to the logger
        if hasattr(record, "extra_info"):
            log_obj.update(record.extra_info)
            
        # Exception details
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

def setup_logger(name="steelsense"):
    logger = logging.getLogger(name)
    
    # Only configure if it hasn't been configured yet
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()

def set_correlation_id(cid: str = None) -> str:
    """Sets the correlation ID for the current async context."""
    if cid:
        correlation_id.set(cid)
        return cid
    new_cid = str(uuid.uuid4())
    correlation_id.set(new_cid)
    return new_cid

def get_correlation_id() -> str:
    """Gets the current correlation ID."""
    return correlation_id.get()
