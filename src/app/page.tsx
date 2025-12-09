import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className='mx-auto'>
      <section id='home' className="w-full h-screen bg-cover  bg-no-repeat" 
        style={{ backgroundImage: "url('/trading bg2.jpg')" }}
      >
        <div className='mt-40 w-[70%]  mx-auto text-center'>
          <h1 className='text-white text-5xl font-bold'>Deriv Copy Trading System</h1>
          <h2 className='mt-5 text-white text-3xl font-bold'>Secure, Fast, and Customizable</h2>
          <p className='mt-5 text-xl text-white shadow'>
            Experience the future of trading with our secure, fast, and customizable copy trading system. Seamlessly integrate with Deriv and Tradingview for a reliable trading experience.
          </p>

          <Link href='/dashboard'><button className={styles.homeBnt}>Access the dashboard</button></Link>
        </div>
      </section>

      <section id='feature'>
        <div className='mt-15 text-center mx-auto w-[70%]'>
          <h2 className='text-3xl font-bold text-[var( --primary)]'>Why Choose Our Copy Trading System?</h2>
          <p className='mt-5 text-xl'>
            Our system is designed to be secure, fast, and easy to customize, ensuring a reliable trading experience, 
            also Our system integrates seamlessly with Deriv and Tradingview, offering robust features and a cloud server for optimal performance.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className='relative w-full h-70'>
              <Image src="/secure.jpg" alt='bgg' fill className='object-center object-cover'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold'>Secure Trading</h3>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className='relative w-full h-70'>
              <Image src="/trading bg.jpg" alt='bgg' fill className='object-center object-cover'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold'>Fast</h3>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className='relative w-full h-70'>
              <Image src="/bg.jpg" alt='bgg' fill className='object-center object-cover'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold'>Customizable Trading</h3>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className='relative w-full h-70'>
              <Image src="/Reliable.jpg" alt='bgg' fill className='object-center object-cover'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold'>Reliable</h3>
            </div>
          </div>
          {/* Features content can be added here */}
        </div>
      </section>

      <section id='about'>
        <div className='mt-30 text-center mx-auto w-[70%]'>
          <h1 className='text-3xl font-bold text-[var( --primary)]'>About tradingunity.com Copy Trading</h1>
          <h2 className='mt-5 text-2xl font-bold text-[var( --primary)]'>Learn more about our mission and values.</h2>
          <p className='mt-5 text-xl'>
            At tradingunity.com, we are dedicated to providing the best copy trading experience for our users. With a focus on security, speed, and customization, we strive to deliver a reliable and efficient trading system.
            <br></br>
            <br></br>
            Our team consists of experienced software developers for the trading industry who are passionate about leveraging technology to enhance the trading process. We continuously innovate and improve our system to meet the evolving needs of our users.
          </p>
        </div>
      </section>

      <section id='testimonial'>
        <div className='mt-15 text-center mx-auto w-[70%]'>
          <h1 className='text-3xl font-bold text-[var( --primary)]'>Testimonials</h1>
          <p className='mt-5 text-xl'>
            Our system is designed to be secure, fast, and easy to customize, ensuring a reliable trading experience, 
            also Our system integrates seamlessly with Deriv and Tradingview, offering robust features and a cloud server for optimal performance.
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.testimonialImage}>
              <Image src="/close-up-smiley-man-with-glasses.jpg" alt='bgg' fill className='object-center object-cover rounded-4xl'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold mt-2'>Secure Trading</h3>
              <p className=' text-black italic text-10'>
                This copy trading system has transformed my trading experience. The security features
                give me peace of mind, and the speed of execution is unmatched.
              </p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.testimonialImage}>
              <Image src="/blacklady.jpg" alt='bgg' fill className='object-center object-fill rounded-4xl'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold mt-2'>Secure Trading</h3>
              <p className=' text-black italic text-10'>
                This copy trading system has transformed my trading experience. The security features
                give me peace of mind, and the speed of execution is unmatched.
              </p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.testimonialImage}>
              <Image src="/smiling-african-american-man-looking.jpg" alt='bgg' fill className='object-center object-cover rounded-4xl'/>
            </div>
            <div className='p-2'>
              <h3 className='text-xl text-black font-bold mt-2'>Secure Trading</h3>
              <p className=' text-black italic text-10'>
                This copy trading system has transformed my trading experience. The security features
                give me peace of mind, and the speed of execution is unmatched.
              </p>
            </div>
          </div>
          {/* Features content can be added here */}
        </div>
      </section>

      <section id='newAcct'>
        <div className='mt-15 text-center mx-auto w-[70%]'>
          <h1 className='text-3xl font-bold text-[var( --primary)]'>Create Your Deriv Account Today</h1>
          <h2 className='mt-5 text-2xl font-bold text-[var( --primary)]'>Start your journey with our powerful copy trading system</h2>
          <p className='mt-5 text-xl'>
            Join thousands of successful traders who have already taken advantage of our cutting-edge platform. Creating an account is quick, easy, and opens the door to a world of trading opportunities.
          </p>
        </div>

        <ul className={styles.benefitList}> 
          <li>Access to advanced trading tools</li>
          <li>Real-time market data</li>
          <li>Seamless integration with Deriv and TradingView</li>
          <li>24/7 customer support</li>
        </ul>

        <a href="https://deriv.be/" target='blank'><button className={styles.acctBnt}>Create Your Account Now</button></a> 
      </section>

      <section id='contact'>
        <h1>Get in Touch</h1>
        
      </section>
    </main>
  )
}