import Link from 'next/link';
import Image from 'next/image';

const AuthHeader: React.FC = () => {
    return (
        <div className="header">
            <Image
                src="/images/logo.png"
                alt="SHARE"
                className="logo"
                width={150}
                height={40}
                priority
            />
            <div className="nav">
                <Link href="/register" className="nav-link">
                    新規登録
                </Link>
                <Link href="/login" className="nav-link">
                    ログイン
                </Link>
            </div>

            <style jsx>{`
                .header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                }

                .logo {
                    height:3.5rem;
                    width: auto;
                }

                .nav {
                    display: flex;
                    gap: 1rem;
                }

                .nav-link {
                    color: white;
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .nav-link:hover {
                    color: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default AuthHeader;