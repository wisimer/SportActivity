import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nmqckiusggqtprmunxoq.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcWNraXVzZ2dxdHBybXVueG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MjA0MDIsImV4cCI6MjA0OTE5NjQwMn0.1mLC0kcrUmPkvoXkM4ppvEvrkemIyAeWyDBgKAM8ow8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SportAvatar = {
    id: string
    img_url: string
    sport_type: string
    created_at: string
}

export type TaskMessage = {
    id: string
    task_status: number
    created_at: string
}