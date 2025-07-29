import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import Image from "react-bootstrap/Image";
import { AuthContext } from "../components/AuthProvider";

export default function Home() {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (currentUser != null) navigate("/user");
    }, [currentUser, navigate]);

    return (
        <div className="d-flex flex-column align-items-center mt-4">
            <h3 className="mb-4 text-center">Discover what the app does:</h3>
            <div className="carousel-wrapper">
                <Carousel fade>
                    <Carousel.Item>
                        <Image src="/create_or_join_community.png" fluid className="carousel-image" />
                        <Carousel.Caption>
                            <h5>Join or Create Communities</h5>
                            <p>
                                Connect with local groups in your area.<br />
                                or<br />
                                Start a new neighbourhood with ease.
                            </p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image src="/create_new_events.png" fluid className="carousel-image" />
                        <Carousel.Caption>
                            <h5>Host Events</h5>
                            <p>Bring your neighborhood together through events.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image src="/help_or_be_helped.png" fluid className="carousel-image" />
                        <Carousel.Caption>
                            <h5>Request Help Or Offer Help</h5>
                            <p>Ask for help or support nearby members.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image src="/borrow_share.png" fluid className="carousel-image" />
                        <Carousel.Caption>
                            <h5>Borrow & Share</h5>
                            <p>Lend or borrow items within your community.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image src="/view_members.png" fluid className="carousel-image" />
                        <Carousel.Caption>
                            <h5>Meet Members</h5>
                            <p>Get to know your neighbors better.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </div>
        </div>
    );
}
