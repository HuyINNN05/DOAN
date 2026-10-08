import { useCallback } from 'react';
import { Link } from 'react-router';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import useApiResource from '../hooks/useApiResource';
import { listCompanies, listJobs } from '../api/publicApi';

export default function HomePage() {
  const loader = useCallback(async () => {
    const [jobs, companies] = await Promise.all([listJobs({ limit: 6 }), listCompanies()]);
    return { jobs: jobs.items, companies };
  }, []);
  const resource = useApiResource(loader, { jobs: [], companies: [] });

  return (
    <>
      <Header />
      <main className="public-home min-w-0 overflow-x-clip">
        <section className="bg-gradient-to-br from-[#eef6ff] to-white px-5 py-20">
          <div className="mx-auto min-w-0 max-w-6xl">
            <p className="text-sm font-bold text-[#0757c9]">NỀN TẢNG QUẢN LÝ THỰC TẬP</p>
            <h1 className="mt-4 max-w-3xl break-words text-4xl font-extrabold text-[#123a8b] md:text-6xl">Kết nối sinh viên, doanh nghiệp và nhà trường.</h1>
            <p className="mt-5 max-w-2xl break-words text-[#526f94]">Theo dõi toàn bộ quá trình từ ứng tuyển, phỏng vấn đến báo cáo và đánh giá cuối kỳ.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-md bg-[#0757c9] px-5 py-3 font-bold text-white" to="/opportunities">Tìm cơ hội</Link>
              <Link className="rounded-md border px-5 py-3 font-bold" to="/company/register">Đăng ký doanh nghiệp</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto min-w-0 max-w-6xl px-5 py-14">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold text-[#123a8b]">Cơ hội mới</h2><Link className="whitespace-nowrap" to="/opportunities">Xem tất cả →</Link></div>
          {resource.error ? <p role="alert">{resource.error}</p> : <div className="mt-6 grid gap-4 md:grid-cols-3">{resource.data.jobs.map((job) => <article className="min-w-0 rounded-xl border bg-white p-5" key={job.id}><b className="break-words">{job.title}</b><p className="mt-2 break-words text-sm">{job.company_name} · {job.location}</p><small>Hạn {String(job.deadline).slice(0, 10)}</small></article>)}</div>}
        </section>
        <section className="bg-[#f4f8fd] px-5 py-14"><div className="mx-auto min-w-0 max-w-6xl"><h2 className="text-2xl font-bold text-[#123a8b]">Doanh nghiệp đã duyệt</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{resource.data.companies.slice(0, 8).map((company) => <article className="min-w-0 rounded-xl bg-white p-5" key={company.id}><b className="break-words">{company.name}</b><p className="break-words text-sm">{company.industry || 'Đa lĩnh vực'}</p></article>)}</div></div></section>
      </main>
      <Footer />
    </>
  );
}
