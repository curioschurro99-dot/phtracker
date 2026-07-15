-- Run this in Supabase SQL Editor after running Drizzle migrations.
-- Enables Row Level Security and creates per-user policies for all tables.
-- Without these policies, the Supabase anon key (exposed in the browser)
-- grants full read/write access to every user's data via the REST API.

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own row" ON public.users
  FOR ALL USING (auth.uid() = id);

-- habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own logs" ON public.logs
  FOR ALL USING (auth.uid() = user_id);

-- todos
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own todos" ON public.todos
  FOR ALL USING (auth.uid() = user_id);

-- buys
ALTER TABLE public.buys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own buys" ON public.buys
  FOR ALL USING (auth.uid() = user_id);

-- groceries
ALTER TABLE public.groceries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own groceries" ON public.groceries
  FOR ALL USING (auth.uid() = user_id);

-- periods
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own periods" ON public.periods
  FOR ALL USING (auth.uid() = user_id);

-- cycle_meta
ALTER TABLE public.cycle_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own cycle_meta" ON public.cycle_meta
  FOR ALL USING (auth.uid() = user_id);

-- reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);

-- thoughts
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own thoughts" ON public.thoughts
  FOR ALL USING (auth.uid() = user_id);

-- sleep_logs
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own sleep_logs" ON public.sleep_logs
  FOR ALL USING (auth.uid() = user_id);
