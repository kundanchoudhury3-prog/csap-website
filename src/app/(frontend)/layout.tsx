import React from 'react'
import './styles.css'

export const metadata = {
  title: "CSAP IAS Academy — North-East's No. 1 Choice for Civil Services Success",
  description:
    'CSAP IAS Academy, Guwahati: coaching for UPSC, APSC, SSC and Banking exams with live and recorded classes, mentorship and centres across Assam.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
