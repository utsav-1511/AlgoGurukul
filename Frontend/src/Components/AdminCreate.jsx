import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

const LANGUAGES = ["cpp", "java", "javascript", "python"];

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().min(1, "Description is required"),

  difficulty: z.enum(["easy", "medium", "hard"]),

  tags: z.enum([
    "array",
    "linkedList",
    "graph",
    "dp",
    "math",
  ]),

  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explaination: z.string().min(1, "Explaination is required"),
      })
    )
    .min(1, "At least one visible testcase required"),

  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one hidden testcase required"),

  startCode: z.array(
    z.object({
      language: z.string(),
      initialCode: z.string().min(1, "Initial code is required"),
    })
  ),

  referenceSolution: z.array(
    z.object({
      language: z.string(),
      completeCode: z.string().min(1, "Reference solution is required"),
    })
  ),
});

function AdminCreate() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),

    defaultValues: {
      visibleTestCases: [
        {
          input: "",
          output: "",
          explaination: "",
        },
      ],

      hiddenTestCases: [
        {
          input: "",
          output: "",
        },
      ],

      startCode: LANGUAGES.map((lang) => ({
        language: lang,
        initialCode: "",
      })),

      referenceSolution: LANGUAGES.map((lang) => ({
        language: lang,
        completeCode: "",
      })),
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/createProblem", data);
    
      alert("Problem Created Successfully");

      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message || error?.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">
        Create Problem
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* BASIC INFO */}

        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Basic Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label">
                <span className="label-text">Title</span>
              </label>

              <input
                {...register("title")}
                className={`input input-bordered w-full ${
                  errors.title ? "input-error" : ""
                }`}
              />

              {errors.title && (
                <p className="text-error text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">
                  Description
                </span>
              </label>

              <textarea
                {...register("description")}
                rows={8}
                className={`textarea textarea-bordered w-full ${
                  errors.description
                    ? "textarea-error"
                    : ""
                }`}
              />

              {errors.description && (
                <p className="text-error text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label">
                  <span className="label-text">
                    Difficulty
                  </span>
                </label>

                <select
                  {...register("difficulty")}
                  className="select select-bordered w-full"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">
                    Tag
                  </span>
                </label>

                <select
                  {...register("tags")}
                  className="select select-bordered w-full"
                >
                  <option value="array">Array</option>
                  <option value="linkedList">
                    Linked List
                  </option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                  <option value="math">Math</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* VISIBLE TEST CASES */}

        <div className="card bg-base-100 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">
              Visible Test Cases
            </h2>

            <button
              type="button"
              onClick={() =>
                appendVisible({
                  input: "",
                  output: "",
                  explaination: "",
                })
              }
              className="btn btn-primary btn-sm"
            >
              Add
            </button>
          </div>

          <div className="space-y-5">
            {visibleFields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-xl p-5 space-y-3"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      removeVisible(index)
                    }
                    className="btn btn-error btn-xs"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(
                    `visibleTestCases.${index}.input`
                  )}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />

                <input
                  {...register(
                    `visibleTestCases.${index}.output`
                  )}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />

                <textarea
                  {...register(
                    `visibleTestCases.${index}.explaination`
                  )}
                  placeholder="Explaination"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* HIDDEN TEST CASES */}

        <div className="card bg-base-100 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">
              Hidden Test Cases
            </h2>

            <button
              type="button"
              onClick={() =>
                appendHidden({
                  input: "",
                  output: "",
                })
              }
              className="btn btn-primary btn-sm"
            >
              Add
            </button>
          </div>

          <div className="space-y-5">
            {hiddenFields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-xl p-5 space-y-3"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      removeHidden(index)
                    }
                    className="btn btn-error btn-xs"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(
                    `hiddenTestCases.${index}.input`
                  )}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />

                <input
                  {...register(
                    `hiddenTestCases.${index}.output`
                  )}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CODE SECTION */}

        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Code Templates
          </h2>

          <div className="space-y-10">
            {console.log(LANGUAGES)}
            {LANGUAGES.map((lang, index) => (
              <div
                key={lang}
                className="border rounded-xl p-5"
               >
                <h3 className="text-xl font-semibold mb-4">
                  {lang}
                </h3>

                {/* START CODE */}

                <div className="mb-5">
                  <label className="label">
                    <span className="label-text">
                      Initial Code
                    </span>
                  </label>

                  <textarea
                    {...register(
                      `startCode.${index}.initialCode`
                    )}
                    rows={8}
                    className="textarea textarea-bordered w-full font-mono"
                  />
                </div>

                {/* REFERENCE SOLUTION */}

                <div>
                  <label className="label">
                    <span className="label-text">
                      Reference Solution
                    </span>
                  </label>

                  <textarea
                    {...register(
                      `referenceSolution.${index}.completeCode`
                    )}
                    rows={8}
                    className="textarea textarea-bordered w-full font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminCreate;
