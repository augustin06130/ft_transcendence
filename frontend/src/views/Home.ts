import { div, p, pre, span } from "@framework/tags";

export default function Home() {
  return div(
    { class: "mx-auto" },
    div(
      {
        class:
          "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10",
      },
      div(
        {
          class:
            "flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4",
        },
        div({ class: "h-3 w-3 rounded-full bg-green-500" }),
        p({ class: "text-xs" }, "terminal@user:~")
      ),

      div(
        { class: "space-y-4" },
        // p({ class: "text-green-400" },
        //   text,
        //   showCursor ? "█" : " "
        // ),

        div(
          { class: "mt-8" },
          p({ class: "text-green-300 opacity-80" }, "$ system.info"),
          pre(
            { class: "mt-2 text-sm" },
            `OS: Terminal_OS v1.0.2
KERNEL: RetroKernel 4.8.15
UPTIME: 3d 7h 14m 32s
MEMORY: 640K (should be enough for anybody)
STATUS: All systems operational`
          )
        ),

        div(
          { class: "mt-4" },
          p({ class: "text-green-300 opacity-80" }, "$ ls -la /projects"),
          pre(
            { class: "mt-2 text-sm" },
            `drwxr-xr-x  2 user terminal  4096 Mar 14 16:22 .
drwxr-xr-x 21 user terminal  4096 Mar 14 16:22 ..
-rw-r--r--  1 user terminal 12680 Mar 14 16:22 project_alpha.exe
-rw-r--r--  1 user terminal  8452 Mar 14 16:22 neural_net.dat
-rw-r--r--  1 user terminal  2048 Mar 14 16:22 quantum_algo.bin`
          )
        ),

        div(
          { class: "mt-4 flex items-center" },
          span({ class: "text-green-400 mr-2" }, "$"),
          div({ class: "h-5 w-2 bg-green-500 animate-pulse" })
        )
      )
    ),

    div(
      { class: "mt-8 text-green-400/70 text-sm text-center" },
      p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`)
    )
  );
}
