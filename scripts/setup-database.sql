-- Enable Row Level Security
ALTER TABLE IF EXISTS public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.form_responses ENABLE ROW LEVEL SECURITY;

-- Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create form_responses table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS forms_user_id_idx ON public.forms(user_id);
CREATE INDEX IF NOT EXISTS forms_is_published_idx ON public.forms(is_published);
CREATE INDEX IF NOT EXISTS form_responses_form_id_idx ON public.form_responses(form_id);

-- Set up Row Level Security policies

-- Forms policies
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;
CREATE POLICY "Users can view their own forms" ON public.forms
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own forms" ON public.forms;
CREATE POLICY "Users can insert their own forms" ON public.forms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own forms" ON public.forms;
CREATE POLICY "Users can update their own forms" ON public.forms
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own forms" ON public.forms;
CREATE POLICY "Users can delete their own forms" ON public.forms
    FOR DELETE USING (auth.uid() = user_id);

-- Allow anyone to view published forms (for form filling)
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;
CREATE POLICY "Anyone can view published forms" ON public.forms
    FOR SELECT USING (is_published = true);

-- Form responses policies
DROP POLICY IF EXISTS "Form owners can view responses" ON public.form_responses;
CREATE POLICY "Form owners can view responses" ON public.form_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Anyone can insert responses to published forms" ON public.form_responses;
CREATE POLICY "Anyone can insert responses to published forms" ON public.form_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.is_published = true
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for forms table
DROP TRIGGER IF EXISTS update_forms_updated_at ON public.forms;
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON public.forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
