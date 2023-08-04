--
-- PostgreSQL database dump
--

-- Dumped from database version 14.8 (Ubuntu 14.8-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.8 (Ubuntu 14.8-0ubuntu0.22.04.1)

-- Started on 2023-08-03 22:00:02 -03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 214 (class 1255 OID 16422)
-- Name: update_total_visits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_total_visits() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE "users" SET "totalVisits" = (SELECT SUM("visitCount") FROM "urls" WHERE "userId" = NEW."id")
    WHERE "id" = NEW."id";
    RETURN NEW;
END;
$$;


--
-- TOC entry 215 (class 1255 OID 16434)
-- Name: update_user_visit_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_visit_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update the visitCount for each user in the "users" table
    UPDATE "users" AS u
    SET "visitCount" = COALESCE((
        SELECT SUM(uv."visitCount")
        FROM "urls" AS ur
        JOIN "url_visits" AS uv ON ur."id" = uv."urlID"
        WHERE ur."userID" = NEW."userID"
    ), 0)
    WHERE "id" = NEW."userID";

    -- Return the updated row
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 209 (class 1259 OID 16387)
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    "userId" integer NOT NULL,
    "Token" text NOT NULL,
    "lastStatus" timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 210 (class 1259 OID 16394)
-- Name: urls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.urls (
    id integer NOT NULL,
    "shortURL" text NOT NULL,
    url text NOT NULL,
    "visitCount" integer,
    "userId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 211 (class 1259 OID 16400)
-- Name: urls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.urls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3385 (class 0 OID 0)
-- Dependencies: 211
-- Name: urls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.urls_id_seq OWNED BY public.urls.id;


--
-- TOC entry 212 (class 1259 OID 16401)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "totalVisits" integer,
    email text NOT NULL,
    url_count integer
);


--
-- TOC entry 213 (class 1259 OID 16407)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3386 (class 0 OID 0)
-- Dependencies: 213
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3223 (class 2604 OID 16408)
-- Name: urls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urls ALTER COLUMN id SET DEFAULT nextval('public.urls_id_seq'::regclass);


--
-- TOC entry 3225 (class 2604 OID 16409)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3227 (class 2606 OID 16411)
-- Name: sessions sessions_Token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_Token_key" UNIQUE ("Token");


--
-- TOC entry 3229 (class 2606 OID 16413)
-- Name: urls urls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urls
    ADD CONSTRAINT urls_pkey PRIMARY KEY (id);


--
-- TOC entry 3231 (class 2606 OID 16415)
-- Name: urls urls_shortURL_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urls
    ADD CONSTRAINT "urls_shortURL_key" UNIQUE ("shortURL");


--
-- TOC entry 3233 (class 2606 OID 16417)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3235 (class 2606 OID 16419)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3237 (class 2606 OID 16421)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3240 (class 2620 OID 16423)
-- Name: urls update_total_visits_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_total_visits_trigger AFTER INSERT OR UPDATE ON public.urls FOR EACH ROW EXECUTE FUNCTION public.update_total_visits();


--
-- TOC entry 3238 (class 2606 OID 16424)
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 3239 (class 2606 OID 16429)
-- Name: urls urls_userID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urls
    ADD CONSTRAINT "urls_userID_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


-- Completed on 2023-08-03 22:00:02 -03

--
-- PostgreSQL database dump complete
--

