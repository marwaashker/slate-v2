
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f4f4f4'
    }}>
      <SignUp   appearance={{
          variables: {
            colorPrimary: '#639922',          
            colorBackground: '#ffffff',
            colorText: '#1a1a18',
            colorTextSecondary: '#6b6b66',
            colorInputBackground: '#f7f6f3',
            colorInputText: '#1a1a18',
            borderRadius: '10px',
            fontFamily: 'Elms Sans, sans-serif',
          },
          elements: {
            card: {
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.09)',
            },
            formButtonPrimary: {
              background: '#1a1a18',
              '&:hover': {
                background: '#333',
              }
            },
            headerTitle: {
              fontFamily: 'Elms Sans, sans-serif',
            },
            socialButtonsBlockButton: {
              border: '1px solid rgba(0,0,0,0.12)',
              color: '#1a1a18',
            }
          }
        }}/>
    </div>
  )
}