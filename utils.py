from passlib.context import CryptContext
import secrets
from datetime import datetime , timedelta
from config import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")


def hash(password: str) :
    return pwd_context.hash(password)

def verify_password(user_password: str, hashed_password) :
    return pwd_context.verify(user_password,hashed_password)

def generate_otp() :
    """Secure 6 digit otp will be genereated"""
    return ''.join([str(secrets.randbelow(10))for _ in range(6)])

def get_otp_expiry(minutes=5) :
    return datetime.utcnow() + timedelta(minutes=minutes)

# Sending OTP to the email who is logging in 
def send_otp_to_email(receiver_email, otp_code) :
    try :
        message = Mail(
            from_email = settings.SENDGRID_SENDER_EMAIL,
            to_emails= receiver_email,
            subject= "Your IoT App OTP Verification Code",
            plain_text_content= f"Your OTP codde is : {otp_code}. It is valid for 5 minutes"
        )
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        print(response.status_code)
        return True
    
    except Exception as e :
        print(f"SendGrid Error: {e}")
        return False