"use client";

import Signature from "./signature";
import { useState, useEffect, type FormEvent } from "react";

const CONTACT_SITE = "photography.yanabourne.com";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message) {
      setPrefilledMessage(decodeURIComponent(message));
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");

    const body: Record<string, string> = {
      site: CONTACT_SITE,
      name,
      email,
      message: prefilledMessage,
      page: window.location.pathname,
      website,
    };

    const phoneInput = e.currentTarget.elements.namedItem(
      "phone",
    ) as HTMLInputElement | null;
    if (phoneInput?.value) {
      body.phone = phoneInput.value;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let ok = false;
      if (res.status === 200) {
        try {
          const data = (await res.json()) as { ok?: boolean };
          ok = data.ok === true;
        } catch {
          ok = false;
        }
      }

      if (ok) {
        setStatus("ok");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-slate-900" id="contact">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {status === "ok" ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <h3
                    className="font-bold"
                    data-sb-field-path="form.successMessage.title"
                  >
                    Thank you!
                  </h3>
                  <p data-sb-field-path="form.successMessage.description">
                    I'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form className="w-full" onSubmit={handleSubmit}>
                  <div
                    className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
                    aria-hidden="true"
                    style={{ clip: "rect(0, 0, 0, 0)" }}
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label
                        className="block text-left text-slate-300 text-sm font-medium mb-1"
                        htmlFor="name"
                        data-sb-field-path="form.name.label"
                      >
                        Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="form-input w-full bg-slate-800 border border-slate-700 focus:border-slate-600 rounded-sm px-4 py-3 text-white placeholder-slate-500"
                        placeholder="Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label
                        className="block text-left text-slate-300 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input w-full bg-slate-800 border border-slate-700 focus:border-slate-600 rounded-sm px-4 py-3 text-white placeholder-slate-500"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label
                        className="block text-left text-slate-300 text-sm font-medium mb-1"
                        htmlFor="message"
                        data-sb-field-path="form.message.label"
                      >
                        Message <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="form-textarea w-full bg-slate-800 border border-slate-700 focus:border-slate-600 rounded-sm px-4 py-3 text-white placeholder-slate-500"
                        placeholder="Message"
                        required
                        data-sb-field-path="form.message.placeholder"
                        value={prefilledMessage}
                        onChange={(e) => setPrefilledMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mt-6">
                    <div className="w-full px-3">
                      <button
                        type="submit"
                        disabled={status === "pending"}
                        className="p-2 rounded-sm text-white bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50"
                      >
                        {status === "pending" ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>

                  {status === "error" && (
                    <div
                      className="mt-4 text-red-500 text-sm"
                      data-sb-field-path="form.errorMessage"
                    >
                      Error submitting form
                    </div>
                  )}
                </form>
              )}

              <div>
                <h2
                  className="text-3xl flex text-slate-100 mb-4 relative"
                  data-sb-field-path="heading"
                >
                  Get in touch!
                </h2>

                <p
                  className="text-xl text-slate-400"
                  data-sb-field-path="description"
                >
                  If you are interested in booking a session, booking our home
                  studio, or just want to connect, I'd love to hear from you.
                </p>
                <div className="relative w-42 h-42 my-4">
                  <Signature title="Yana Bourne" className="text-4xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}