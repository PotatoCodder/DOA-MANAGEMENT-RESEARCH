import React from 'react'
import Image from 'next/image'
import orgChart from '../../assets/images/OrganizationalChart.jpg'

export default function OrganizationalChartPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        src={orgChart}
        alt="Organizational Chart"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}
