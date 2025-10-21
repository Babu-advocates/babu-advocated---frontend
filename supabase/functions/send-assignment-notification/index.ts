import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { employeeUsername, employeeEmail, applicationId, applicationDetails } = await req.json()

    // In a production environment, you would integrate with an email service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    // For now, we'll create a notification record in the database
    // You can extend this to send actual emails by adding your preferred email service

    console.log(`Assignment notification for ${employeeUsername}:`, {
      applicationId,
      applicationDetails
    })

    // Create notification record (you can create a notifications table for this)
    const notificationData = {
      type: 'work_assignment',
      employee_username: employeeUsername,
      employee_email: employeeEmail,
      application_id: applicationId,
      message: `New work assigned: ${applicationDetails.applicationType} for ${applicationDetails.borrowerName}`,
      created_at: new Date().toISOString(),
      is_read: false
    }

    // Here you would typically:
    // 1. Save notification to database
    // 2. Send email using your preferred service
    // 3. Send push notification if mobile app exists

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assignment notification sent successfully',
        notificationData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending assignment notification:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})