import React, { useEffect, useRef, useState } from "react";
import ErrorPage from "./ErrorPage";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your-publishable-key-here");

const Resume = ({ result, email }) => {
    const componentRef = useRef();
    const [tokens, setTokens] = useState(0);
    const [loading, setLoading] = useState(true);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${result.fullName} Resume`,
        onAfterPrint: () => {
            axios.post('/api/payment/print-cv', { email })
                .then(response => {
                    setTokens(response.data.tokens);
                    alert("Print Successful!");
                })
                .catch(error => {
                    console.error(error);
                    alert('Failed to deduct token');
                });
        },
    });

    const fetchUserTokens = async () => {
        if (!email) {
            console.error("Email is undefined");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`/api/users/${email}/tokens`);
            setTokens(response.data.tokens);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tokens:", error);
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            const stripe = await stripePromise;
            const response = await axios.post('/api/payment/create-checkout-session', { email });
            const { sessionId } = response.data;

            const result = await stripe.redirectToCheckout({ sessionId });
            if (result.error) {
                console.error("Stripe checkout error:", result.error.message);
                alert("Payment failed");
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            alert('Payment initiation failed');
        }
    };

    useEffect(() => {
        fetchUserTokens();
    }, [email]);

    if (JSON.stringify(result) === "{}") {
        return <ErrorPage />;
    }

    const replaceWithBr = (string) => {
        return string.replace(/\n/g, "<br />");
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ height: '100vh' }}>
            {tokens === 0 ? (
                <button style={{ marginTop: '40px', marginLeft: '100px' }} onClick={handlePayment}>
                    Make Payment
                </button>
            ) : (
                <p style={{ marginTop: '40px', marginLeft: '100px' }}>Tokens Remaining: {tokens}</p>
            )}
            <button
                style={{ marginTop: '20px', marginLeft: '100px' }}
                onClick={handlePrint}
                disabled={tokens === 0}
            >
                Print Page
            </button>
            <main className='container' ref={componentRef}>
                <header className='header'>
                    <div>
                        <h1>{result.fullName}</h1>
                        <p className='resumeTitle headerTitle'>
                            {result.currentPosition} ({result.currentTechnologies})
                        </p>
                        <p className='resumeTitle'>
                            {result.currentLength} year(s) work experience
                        </p>
                    </div>
                    <div>
                        <img
                            src={result.image_url}
                            alt={result.fullName}
                            className='resumeImage'
                        />
                    </div>
                </header>
                <div className='resumeBody'>
                    <div>
                        <h2 className='resumeBodyTitle'>PROFILE SUMMARY</h2>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: replaceWithBr(result.objective),
                            }}
                            className='resumeBodyContent'
                        />
                    </div>
                    <div>
                        <h2 className='resumeBodyTitle'>WORK HISTORY</h2>
                        {result.workHistory.map((work) => (
                            <p className='resumeBodyContent' key={work.name}>
                                <span style={{ fontWeight: "bold" }}>{work.name}</span> -{" "}
                                {work.position}
                            </p>
                        ))}
                    </div>
                    <div>
                        <h2 className='resumeBodyTitle'>JOB PROFILE</h2>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: replaceWithBr(result.jobResponsibilities),
                            }}
                            className='resumeBodyContent'
                        />
                    </div>
                    <div>
                        <h2 className='resumeBodyTitle'>JOB RESPONSIBILITIES</h2>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: replaceWithBr(result.keypoints),
                            }}
                            className='resumeBodyContent'
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Resume;
