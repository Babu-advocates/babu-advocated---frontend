-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Set replica identity for real-time updates
ALTER TABLE notifications REPLICA IDENTITY FULL;