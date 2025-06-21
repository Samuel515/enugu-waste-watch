
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_report_submitted ON public.reports;
DROP TRIGGER IF EXISTS on_report_status_updated ON public.reports;

-- Recreate the report submission notification trigger
CREATE OR REPLACE FUNCTION public.create_report_submission_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create notification for officials about new report
    INSERT INTO public.notifications (
        title, 
        message, 
        type, 
        recipient_role,
        for_all, 
        created_by
    ) VALUES (
        'New Waste Report Submitted', 
        'A new waste report "' || NEW.title || '" has been submitted in ' || NEW.location || ' by ' || COALESCE(NEW.user_name, 'a resident') || '.',
        'report',
        'official',
        true, 
        NEW.user_id
    );
    
    RETURN NEW;
END;
$$;

-- Recreate the report status update notification trigger
CREATE OR REPLACE FUNCTION public.create_report_status_update_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only create notification if status actually changed and it's not the initial creation
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Delete any existing unread notifications for this report status change
        DELETE FROM public.notifications 
        WHERE for_user_id = NEW.user_id 
          AND type = 'report'
          AND message LIKE '%' || NEW.title || '%'
          AND read = false;
        
        -- Create new notification for report submitter about status change
        INSERT INTO public.notifications (
            title, 
            message, 
            type, 
            for_user_id,
            for_all,
            created_by
        ) VALUES (
            'Report Status Updated', 
            'Your waste report "' || NEW.title || '" status changed from ' || COALESCE(OLD.status, 'unknown') || ' to ' || NEW.status || '.',
            'report',
            NEW.user_id,
            false,
            NULL
        );
        
        -- Log successful notification creation
        RAISE NOTICE 'Created status update notification for user % and report %', NEW.user_id, NEW.title;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the update
        RAISE WARNING 'Failed to create notification: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create the triggers
CREATE TRIGGER on_report_submitted
    AFTER INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.create_report_submission_notification();

CREATE TRIGGER on_report_status_updated
    AFTER UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.create_report_status_update_notification();

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
